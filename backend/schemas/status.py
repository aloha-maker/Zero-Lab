from pydantic import BaseModel

class StatusRequest(BaseModel):
    is_hp: bool           # HPかどうかのフラグ
    base_stat: int        # 種族値
    iv: int = 31          # 個体値
    ev: int = 0           # 努力値
    level: int = 50       # レベル
    nature_modifier: float = 1.0 # 性格補正

class StatusResponse(BaseModel):
    real_stat: int