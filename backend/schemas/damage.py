from pydantic import BaseModel

class DamageRequest(BaseModel):
    level: int
    power: int
    attack: int
    defense: int
    is_stab: bool
    effectiveness: float

class DamageResponse(BaseModel):
    min_damage: int
    max_damage: int