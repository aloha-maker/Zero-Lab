import httpx
import asyncio
from bs4 import BeautifulSoup
from core.config import settings
from core.supabase import SupabaseClient

# 取得するデータを定義したGraphQLクエリ (v1beta2仕様に合わせてプレフィックスを削除)
# 技(pokemonmoves)は最新バージョングループ "champions" (id=32) に固定
GRAPHQL_QUERY = """
query GetPokemonData {
  pokemonspecies {
    id
    name
    pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
      name
    }
    pokemons {
      id
      name
      height
      weight
      is_default
      pokemonstats {
        base_stat
        stat_id
      }
      pokemontypes {
        slot
        type {
          id
        }
      }
      pokemonabilities {
        is_hidden
        slot
        ability {
          id
          name
          abilitynames(where: {language_id: {_eq: 11}}) {
            name
          }
        }
      }
      pokemonmoves(where: {versiongroup: {name: {_eq: "champions"}}}) {
        move_id
      }
      pokemonforms {
        pokemonformnames(where: {language_id: {_eq: 11}}) {
          name
          pokemon_name
        }
      }
    }
  }
  move {
    id
    name
    power
    pp
    accuracy
    priority
    type_id
    movenames(where: {language_id: {_eq: 11}}) {
      name
    }
    movedamageclass {
      name
    }
  }
  type {
    id
    name
    typenames(where: {language_id: {_eq: 11}}) {
      name
    }
  }
}
"""

def chunked_upsert(supabase: SupabaseClient, table_name: str, data_list: list, chunk_size: int = 1000):
    """
    Supabaseのペイロード制限を回避するため、データを分割してUpsertする
    """
    if not data_list:
        return 0
        
    inserted_count = 0
    for i in range(0, len(data_list), chunk_size):
        chunk = data_list[i:i + chunk_size]
        supabase.table(table_name).upsert(chunk).execute()
        inserted_count += len(chunk)
    return inserted_count

async def sync_pokemon_data(supabase: SupabaseClient):
    print("🚀 Fetching data from PokeAPI (GraphQL v1beta2)...")
    
    # 1. 非同期HTTPクライアントでGraphQLにリクエスト
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(settings.POKEAPI_GRAPHQL_URL, json={'query': GRAPHQL_QUERY})
        response.raise_for_status()
        data = response.json()

    if "errors" in data:
        raise Exception(f"GraphQL returned errors: {data['errors']}")

    # 返却されるJSONのキーも最新仕様に合わせて変更
    species_data = data['data']['pokemonspecies']
    move_data = data['data']['move']
    type_data = data['data']['type']
    
    # 2. 格納用リスト・辞書の初期化
    db_species = []
    db_pokemon = []
    types_dict = {}
    abilities_dict = {}
    moves_dict = {}
    db_pokemon_types = []
    db_pokemon_abilities = []
    raw_pokemon_moves = []

    print("🧩 Parsing and transforming data...")

    # 3-0. 技マスターの整形
    for mv in move_data:
        mv_id = mv['id']
        mv_names_ja = mv.get('movenames', [])
        damage_class_data = mv.get('movedamageclass')

        moves_dict[mv_id] = {
            "id": mv_id,
            "name_ja": mv_names_ja[0]['name'] if mv_names_ja else None,
            "name_en": mv['name'],
            "type_id": mv['type_id'],
            "damage_class": damage_class_data['name'] if damage_class_data else None,
            "power": mv['power'],
            "pp": mv['pp'],
            "accuracy": mv['accuracy'],
            "priority": mv['priority']
        }

    # 3-1. タイプマスターの整形 (ポケモンに直接紐付かない特殊タイプ(shadow/unknown等)も含めて全件取得)
    for t in type_data:
        t_id = t['id']
        t_names_ja = t.get('typenames', [])

        types_dict[t_id] = {
            "id": t_id,
            "name_ja": t_names_ja[0]['name'] if t_names_ja else None,
            "name_en": t['name']
        }

    # 3. データの整形ループ
    for sp in species_data:
        sp_id = sp['id']
        sp_name_en = sp['name']
        
        names_ja = sp.get('pokemonspeciesnames', [])
        sp_name_ja = names_ja[0]['name'] if names_ja else None

        db_species.append({
            "id": sp_id,
            "national_dex_no": sp_id,
            "name_ja": sp_name_ja,
            "name_en": sp_name_en
        })

        for poke in sp.get('pokemons', []):
            poke_id = poke['id']
            poke_name_en = poke['name']
            is_default = poke['is_default']

            form_category = "other"
            if is_default:
                form_category = "normal"
            elif "-mega" in poke_name_en:
                form_category = "mega"
            elif "-gmax" in poke_name_en:
                form_category = "gmax"
            elif any(region in poke_name_en for region in ["-alola", "-galar", "-hisui", "-paldea"]):
                form_category = "regional"

            stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
            for stat in poke.get('pokemonstats', []):
                stats[stat['stat_id']] = stat['base_stat']

            form_name_ja = None
            for form in poke.get('pokemonforms', []):
                form_names_ja = form.get('pokemonformnames', [])
                if form_names_ja:
                    candidate = form_names_ja[0].get('pokemon_name') or form_names_ja[0].get('name')
                    if candidate:
                        form_name_ja = candidate
                    break

            db_pokemon.append({
                "id": poke_id,
                "species_id": sp_id,
                "form_category": form_category,
                "form_name_ja": form_name_ja,
                "form_name_en": poke_name_en,
                "hp": stats.get(1, 0),
                "attack": stats.get(2, 0),
                "defense": stats.get(3, 0),
                "sp_attack": stats.get(4, 0),
                "sp_defense": stats.get(5, 0),
                "speed": stats.get(6, 0),
                "height_dm": poke['height'],
                "weight_hg": poke['weight'],
                "image_url": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{poke_id}.png"
            })

            for pt in poke.get('pokemontypes', []):
                t_data = pt['type']
                t_id = t_data['id']

                db_pokemon_types.append({
                    "pokemon_id": poke_id,
                    "type_id": t_id,
                    "slot": pt['slot']
                })

            for pa in poke.get('pokemonabilities', []):
                a_data = pa['ability']
                a_id = a_data['id']
                a_names_ja = a_data.get('abilitynames', [])
                
                abilities_dict[a_id] = {
                    "id": a_id,
                    "name_ja": a_names_ja[0]['name'] if a_names_ja else None,
                    "name_en": a_data['name']
                }
                db_pokemon_abilities.append({
                    "pokemon_id": poke_id,
                    "ability_id": a_id,
                    "is_hidden": pa['is_hidden'],
                    "slot": pa['slot']
                })

            for pm in poke.get('pokemonmoves', []):
                raw_pokemon_moves.append({
                    "pokemon_id": poke_id,
                    "move_id": pm['move_id']
                })

    print("🧹 Deduplicating relationships...")
    db_pokemon_moves = [dict(t) for t in {tuple(d.items()) for d in raw_pokemon_moves}]
    db_pokemon_abilities_deduped = list({(d['pokemon_id'], d['ability_id']): d for d in db_pokemon_abilities}.values())
    db_pokemon_types_deduped = list({(d['pokemon_id'], d['type_id']): d for d in db_pokemon_types}.values())

    print("💾 Upserting data to Supabase...")
    
    chunked_upsert(supabase, "types", list(types_dict.values()))
    chunked_upsert(supabase, "abilities", list(abilities_dict.values()))
    chunked_upsert(supabase, "moves", list(moves_dict.values()))
    
    chunked_upsert(supabase, "pokemon_species", db_species)
    chunked_upsert(supabase, "pokemon", db_pokemon)
    
    chunked_upsert(supabase, "pokemon_types", db_pokemon_types_deduped)
    chunked_upsert(supabase, "pokemon_abilities", db_pokemon_abilities_deduped)
    chunked_upsert(supabase, "pokemon_moves", db_pokemon_moves)

    print("🎉 Synchronization complete!")

    return {
        "species_count": len(db_species),
        "pokemon_count": len(db_pokemon),
        "types_count": len(types_dict),
        "abilities_count": len(abilities_dict),
        "moves_count": len(moves_dict),
        "moves_relations_count": len(db_pokemon_moves)
    }
    
async def sync_scraped_moves(supabase: SupabaseClient, pokemon_id: int, target_url: str):
    """
    対象URLから技データをスクレイピングし、Supabaseのpokemon_movesテーブルに同期する
    """
    print(f"🌐 サイトから {pokemon_id} の技データをスクレイピングします:\n {target_url}")
    
    # 1. 先にSupabase(movesテーブル)からマスタデータを取得しておく
    try:
        response = supabase.table("moves").select("id, name_ja").execute()
        db_moves = response.data
    except Exception as e:
        print(f"❌ movesテーブルの取得に失敗しました: {e}")
        raise

    # 技名(日本語)をキー、IDを値とする辞書を作成
    move_name_to_id = {m["name_ja"]: m["id"] for m in db_moves if m.get("name_ja")}

    # 2. サイトからのデータ取得
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(target_url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as e:
        print(f"❌ ページの取得に失敗しました: {e}")
        raise Exception(f"ページの取得に失敗しました: {e}")

    # 【重要】yakkun.com (ポケモン徹底攻略) は EUC-JP でエンコードされている。
    # Shift_JISとして解釈すると半角カナ等が化けてしまうため、
    # response.text (httpxの自動デコード) は使わず、生バイトをBeautifulSoupに渡して
    # html.parser にmetaタグから文字コードを検出させる。
    soup = BeautifulSoup(response.content, "html.parser", from_encoding="euc-jp")
    
    scraped_move_names = set()
    
    # 3. 汎用的なセレクタで取得 (クラス名に依存せず、テーブル内のaタグを全て対象にする)
    # yakkun.com 等のWikiサイトは <td><a href="...">なみのり</a></td> という構造が多いため
    move_elements = soup.select("table tr td a") 
    
    for el in move_elements:
        name = el.text.strip()
        # 取得したテキストが、DBの技マスタに完全に一致するものだけを「技名」として扱う
        # （これにより、「タイプ」や「特性」などの余計なリンクを自動的に除外できます）
        if name and name in move_name_to_id:
            scraped_move_names.add(name)
            
    if not scraped_move_names:
        # デバッグ用：何が取得されていたかをログに残す
        sample_texts = [el.text.strip() for el in soup.select("table tr td a") if el.text.strip()][:15]
        print(f"⚠️ 取得されたテキストのサンプル: {sample_texts}")
        raise Exception("技名が取得できませんでした。HTML構造が変わった可能性があります。")
        
    print(f"🔍 {len(scraped_move_names)}件の技名を取得しました。DBに登録します...")
    
    records_to_upsert = []
    
    # 4. Upsert用データの作成
    for move_name in scraped_move_names:
        move_id = move_name_to_id[move_name] # inチェック済みのため必ず取得可能
        records_to_upsert.append({
            "pokemon_id": pokemon_id,
            "move_id": move_id
        })
            
    print(f"💾 {len(records_to_upsert)}件の技を pokemon_moves テーブルに登録(Upsert)します...")
    
    # 5. Supabase(pokemon_movesテーブル)へのUpsert実行
    try:
        supabase.table("pokemon_moves").upsert(records_to_upsert).execute()
        print("✅ pokemon_moves テーブルへの登録が完了しました。")
    except Exception as e:
        print(f"❌ pokemon_moves テーブルへのUpsertに失敗しました: {e}")
        raise

    # APIのレスポンス用に結果を返す
    return {
        "pokemon_id": pokemon_id,
        "scraped_count": len(scraped_move_names),
        "upserted_count": len(records_to_upsert),
        # 存在しない技名は最初から弾かれるため、今回は空リストを返す
        "unmatched_names": [] 
    }


# 種族値テーブルの行ラベル(サイト表記) → pokemonテーブルのカラム名
STATS_ROW_LABEL_TO_COLUMN = {
    "HP": "hp",
    "攻撃": "attack",
    "防御": "defense",
    "特攻": "sp_attack",
    "特防": "sp_defense",
    "素早": "speed",
}


async def sync_scraped_stats(
    supabase: SupabaseClient,
    pokemon_id: int,
    target_url: str,
):
    """
    対象URLの「種族値」テーブルをスクレイピングし、pokemonテーブルの
    hp/attack/defense/sp_attack/sp_defense/speed を更新する。

    PokeAPI(GraphQL)側にメガシンカ等のサブフォームの種族値が
    含まれていないケースがあるため、その代替データソースとして利用する。

    yakkun.comはフォームごとに専用URL(例: 通常=n260, メガ=n260m)を持っており、
    そのページの主役(テーブル左側の基本列 td.stats_value)が対象pokemon_idの
    種族値になる。そのためフォーム名による列の出し分けは不要で、常に基本列を読む。
    """
    print(f"🌐 サイトから {pokemon_id} の種族値データをスクレイピングします:\n {target_url}")

    # 1. 対象ポケモンがDBに存在するか確認
    try:
        response = (
            supabase.table("pokemon")
            .select("id")
            .eq("id", pokemon_id)
            .single()
            .execute()
        )
        target_pokemon = response.data
    except Exception as e:
        print(f"❌ pokemonテーブルの取得に失敗しました: {e}")
        raise

    if not target_pokemon:
        raise Exception(
            f"pokemon_id={pokemon_id} がDBに存在しません。先にsync_pokemon_dataを実行してください。"
        )

    # 2. サイトからのデータ取得 (EUC-JP。詳細はsync_scraped_movesのコメント参照)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(target_url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as e:
        print(f"❌ ページの取得に失敗しました: {e}")
        raise Exception(f"ページの取得に失敗しました: {e}")

    soup = BeautifulSoup(response.content, "html.parser", from_encoding="euc-jp")

    # 3. 「種族値」テーブルを特定する (summary="種族値" が目印)
    stats_table = soup.find("table", summary="種族値")
    if stats_table is None:
        raise Exception("種族値テーブルが見つかりませんでした。HTML構造が変わった可能性があります。")

    # 4. 各ステータス行を解析 (常に基本列 td.stats_value を読む)
    scraped_stats = {}
    for row in stats_table.find_all("tr")[1:]:  # ヘッダー行を除く
        label_cell = row.find("td", class_="c1")
        if not label_cell:
            continue
        label = label_cell.get_text(strip=True)
        if label not in STATS_ROW_LABEL_TO_COLUMN:
            continue  # 「平均 / 合計」などはスキップ

        value_cell = row.find("td", class_="stats_value")
        if value_cell is None:
            continue
        # imgタグやランク表示(span.stats_rank)を除いた、直接のテキストノードのみ取得
        raw_text = "".join(
            t for t in value_cell.find_all(string=True, recursive=False)
        ).strip()

        try:
            value = int(raw_text)
        except ValueError:
            print(f"⚠️ 数値化に失敗しました (label={label}, raw_text={raw_text!r})")
            continue

        scraped_stats[STATS_ROW_LABEL_TO_COLUMN[label]] = value

    if len(scraped_stats) < 6:
        raise Exception(
            f"種族値を6項目取得できませんでした(取得できた項目: {list(scraped_stats.keys())})。"
            "HTML構造が変わった可能性があります。"
        )

    print(f"🔍 取得した種族値: {scraped_stats}")

    # 5. Supabase(pokemonテーブル)へのUpdate実行
    try:
        supabase.table("pokemon").update(scraped_stats).eq("id", pokemon_id).execute()
        print("✅ pokemon テーブルの種族値を更新しました。")
    except Exception as e:
        print(f"❌ pokemon テーブルの更新に失敗しました: {e}")
        raise

    return {
        "pokemon_id": pokemon_id,
        "scraped_stats": scraped_stats,
    }