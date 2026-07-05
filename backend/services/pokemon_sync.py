import httpx
import asyncio
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