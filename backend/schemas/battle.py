from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class OpponentPokemonBase(BaseModel):
    base_pokemon_id: int
    slot_order: int
    is_selected: bool = False
    is_fainted: bool = False
    is_tera_used: bool = False
    is_mega_used: bool = False
    tera_type: Optional[str] = None
    item_id: Optional[int] = None
    ability_id: Optional[int] = None
    moves: Optional[List[int]] = []

class OpponentPokemonCreate(OpponentPokemonBase):
    pass

class OpponentPokemonUpdate(OpponentPokemonBase):
    id: Optional[UUID] = None # 更新時はIDがある場合とない場合(新規)がある

class OpponentPokemonResponse(OpponentPokemonBase):
    id: UUID
    battle_id: UUID

    class Config:
        from_attributes = True

class BattleBase(BaseModel):
    season_id: Optional[int] = None
    result: Optional[str] = None
    my_team: Optional[List[int]] = []
    memo: Optional[str] = None

class BattleCreate(BaseModel):
    user_id: UUID  # 本番環境ではJWTトークンから取得するのがベター
    season_id: Optional[int] = None
    opponent_team: List[OpponentPokemonCreate] # 初期パーティ6匹

class BattleUpdate(BattleBase):
    pass

class BattleResponse(BattleBase):
    id: UUID
    user_id: UUID
    season_id: Optional[int] = None
    created_at: datetime
    opponent_pokemons: List[OpponentPokemonResponse] = []

    class Config:
        from_attributes = True

class BattleResultUpdate(BaseModel):
    result: str  # 'win', 'lose', 'draw' のいずれか

class BattleAdviceRequest(BaseModel):
    my_party: List[str]       # 自パーティ（6体）
    enemy_party: List[str]    # 相手パーティ（6体）
    rule: str = "single"      # single or double
    regulation: str

class BattleAdviceResponse(BaseModel):
    recommended_selection: List[str]
    lead_pokemon: str
    reasons: List[str]
    threats: List[str]
    notes: List[str]