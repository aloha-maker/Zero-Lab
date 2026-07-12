# backend/routers/type_matchup.py
from fastapi import APIRouter, HTTPException, Depends
import httpx
from schemas.type_matchup import TypeMatchupRequest, TypeMatchupResponse, ComplementaryResponse
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message, get_complementary_pokemon_service
from core.supabase import get_supabase, SupabaseClient

router = APIRouter()

# ==========================================
# 既存：攻撃相性の計算エンドポイント[cite: 3]
# ==========================================
@router.post("/", response_model=TypeMatchupResponse)
async def calculate_matchup(req: TypeMatchupRequest, supabase: SupabaseClient = Depends(get_supabase)): #[cite: 3]
    attacker = req.attacker_type.lower() #[cite: 3]
    defenders = [t.lower() for t in req.defender_types if t] #[cite: 3]

    if not defenders: #[cite: 3]
        raise HTTPException(status_code=400, detail="防御側のタイプを少なくとも1つ指定してください。") #[cite: 3]

    try: #[cite: 3]
        # サービス層でAPIからデータ取得[cite: 3]
        type_data = await fetch_type_data(supabase, attacker) #[cite: 3]
    except httpx.HTTPStatusError: #[cite: 3]
        raise HTTPException(status_code=404, detail=f"タイプ '{attacker}' が見つかりません。") #[cite: 3]
    except Exception: #[cite: 3]
        raise HTTPException(status_code=500, detail="PokeAPIからのデータ取得に失敗しました。") #[cite: 3]

    # サービス層で純粋な計算処理[cite: 3]
    multiplier, msg = calculate_multiplier_and_message(type_data, defenders) #[cite: 3]

    return {"multiplier": multiplier, "message": msg} #[cite: 3]


# ==========================================
# 新規追加：相性補完（弱点被りなし）ポケモンの取得エンドポイント
# ==========================================
@router.get("/complements/{base_pokemon_id}", response_model=ComplementaryResponse)
async def get_complements(base_pokemon_id: int, supabase: SupabaseClient = Depends(get_supabase)):
    """
    主軸となるポケモンのIDを渡し、弱点が被らない補完枠のポケモンリストを取得する
    """
    try:
        # サービス層の非同期関数を呼び出し、DBのやり取りや計算を委譲
        result = await get_complementary_pokemon_service(supabase, base_pokemon_id)
        return result
    except HTTPException as e:
        # サービス層で発生したHTTPException（ポケモンが見つからない等）はそのままレイズ
        raise e
    except Exception as e:
        # その他予期せぬエラーのハンドリング
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")