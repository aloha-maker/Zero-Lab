# 例：sync_opponent_pokemons (Upsert) の実装イメージ
async def upsert_opponent_pokemons(supabase, battle_id, pokemons_in):
    data_to_upsert = []
    for p in pokemons_in:
        p_dict = p.model_dump(exclude_none=True)
        p_dict['battle_id'] = str(battle_id)
        data_to_upsert.append(p_dict)
    
    # Supabaseの強力な upsert 機能を使って一括更新
    # 衝突時（同じ slot_order が存在する場合）は更新されるようにDB側で設定するか、
    # 'id' をキーにして更新します。
    response = supabase.table("battle_opponent_pokemons") \
        .upsert(data_to_upsert) \
        .execute()
    
    return response.data