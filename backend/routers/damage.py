from fastapi import APIRouter
from schemas.damage import DamageRequest, DamageResponse
from services.damage import calculate_pokemon_damage

router = APIRouter()

@router.post("/", response_model=DamageResponse)
def calculate_damage(req: DamageRequest):
    """
    ダメージ計算を行うエンドポイント
    """
    min_dmg, max_dmg = calculate_pokemon_damage(
        level=req.level,
        power=req.power,
        attack=req.attack,
        defense=req.defense,
        is_stab=req.is_stab,
        effectiveness=req.effectiveness
    )
    
    return {
        "min_damage": min_dmg,
        "max_damage": max_dmg
    }