from fastapi import APIRouter, HTTPException
import httpx
from schemas.type_matchup import TypeMatchupRequest, TypeMatchupResponse
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message

router = APIRouter()

@router.post("/", response_model=TypeMatchupResponse)
async def calculate_matchup(req: TypeMatchupRequest):
    attacker = req.attacker_type.lower()
    defenders = [t.lower() for t in req.defender_types if t]

    if not defenders:
        raise HTTPException(status_code=400, detail="防御側のタイプを少なくとも1つ指定してください。")

    try:
        # サービス層でAPIからデータ取得
        type_data = await fetch_type_data(attacker)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail=f"タイプ '{attacker}' が見つかりません。")
    except Exception:
        raise HTTPException(status_code=500, detail="PokeAPIからのデータ取得に失敗しました。")

    # サービス層で純粋な計算処理
    multiplier, msg = calculate_multiplier_and_message(type_data, defenders)

    return {"multiplier": multiplier, "message": msg}