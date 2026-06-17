from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class PokemonMoveDetail(BaseModel):
    name: str           # 技の日本語名
    type: str           # タイプの日本語名 (ほのお、みず など)
    power: Optional[int] = None
    accuracy: Optional[int] = None  # 命中率 (変化技や必中技など、Noneになる可能性があります)
    damage_class: str   # カテゴリ (ぶつり、とくしゅ、へんか)

class SeasonMoveInfo(BaseModel):
    move_name: str
    move_type: str
    category: str
    power: Optional[int] = None
    power_times_atk: Optional[int] = None

class SeasonNatureInfo(BaseModel):
    rank: int
    nature_name: str

class PokemonInfo(BaseModel):
    id: int
    name: str
    english_name: str
    types: List[str]
    abilities: List[str]
    base_stats: Dict[str, int]
    weight_kg: float
    height_m: float
    moves: List[PokemonMoveDetail]
    image_url: Optional[str] = None

class SeasonPokemonInfo(PokemonInfo):
    rank: int
    season_moves: List[SeasonMoveInfo]
    season_natures: List[SeasonNatureInfo]
    max_power_times_atk_by_type: Dict[str, int]
    type_efficacies: Dict[str, float]


class PokemonListItem(BaseModel):
    """サジェスト候補表示用の軽量スキーマ"""
    pokemon_id: int
    name: str
    english_name: str
    image_url: Optional[str] = None
    
