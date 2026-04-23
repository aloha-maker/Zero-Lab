from fastapi import APIRouter
from pydantic import BaseModel
import math

# ルーターの作成（main.py の app の代わりになります）
router = APIRouter()

# リクエストモデル
class DamageRequest(BaseModel):
    level: int
    power: int
    attack: int
    defense: int
    is_stab: bool
    effectiveness: float

# エンドポイントの定義（@app.post ではなく @router.post になります）
@router.post("/")
def calculate_damage(req: DamageRequest):
    # --- ここは以前書いた計算ロジックをそのままペースト ---
    step1 = math.trunc(2 * req.level / 5) + 2
    step2 = math.trunc(step1 * req.power * req.attack / req.defense)
    base_damage = math.trunc(step2 / 50) + 2
    
    if req.is_stab:
        base_damage = math.trunc(base_damage * 1.5)
        
    base_damage = math.trunc(base_damage * req.effectiveness)
    
    min_damage = math.trunc(base_damage * 85 / 100)
    max_damage = math.trunc(base_damage * 100 / 100)
    
    return {
        "min_damage": min_damage,
        "max_damage": max_damage
    }