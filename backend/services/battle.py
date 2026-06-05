import os
from supabase import create_client, Client
from schemas.battle import BattleCreate, OpponentPokemonUpdate,BattleResultUpdate
from uuid import UUID

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def create_battle(battle_in: BattleCreate):
    # 1. battlesテーブルに空の対戦レコードを作成
    battle_data = {"user_id": str(battle_in.user_id)}
    res_battle = supabase.table("battles").insert(battle_data).execute()
    
    battle_id = res_battle.data[0]["id"]

    # 2. 相手のパーティ6匹をインサート
    pokemons_data = []
    for p in battle_in.opponent_team:
        p_dict = p.model_dump(exclude_none=True)
        p_dict["battle_id"] = battle_id
        pokemons_data.append(p_dict)
    
    res_pokemons = supabase.table("battle_opponent_pokemons").insert(pokemons_data).execute()
    
    result_data = res_battle.data[0]
    result_data["opponent_pokemons"] = res_pokemons.data # フロントエンドが待っているキー名にセット
    
    return result_data

async def upsert_opponent_pokemons(battle_id: UUID, pokemons: list[OpponentPokemonUpdate]):
    data_to_upsert = []
    for p in pokemons:
        p_dict = p.model_dump(exclude_none=True)
        p_dict["battle_id"] = str(battle_id)
        # uuidがある場合は文字列に変換、ない場合は除外(新規作成扱い)
        if p_dict.get("id"):
            p_dict["id"] = str(p_dict["id"])
        data_to_upsert.append(p_dict)
    
    # Supabaseのupsert機能（battle_idとslot_orderのUNIQUE制約を利用して上書き）
    res = supabase.table("battle_opponent_pokemons").upsert(
        data_to_upsert, 
        on_conflict="battle_id,slot_order"
    ).execute()
    return res.data

async def update_battle_result(battle_id: UUID, result_in: BattleResultUpdate):
    # battlesテーブルの result カラムだけを更新（UPDATE）する
    res = supabase.table("battles").update({"result": result_in.result}).eq("id", str(battle_id)).execute()
    return res.data