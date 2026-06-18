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
    
class SeasonEvInfo(BaseModel):
    """努力値の調整ランキング情報モデル"""
    view_mode: Optional[str] = Field(None, description="基本は 'ev' など。表示モードの識別子")
    rank: int = Field(..., description="努力値調整の採用率順位")
    spread_name: Optional[str] = Field(None, description="努力値の配分文字（例: 'H4 A252 S252'）")
    parent_spread_name: Optional[str] = Field(None, description="親となる調整名（一元化用）")
    usage_rate: float = Field(..., description="採用率（%表記をパースした数値）")
    
    # 各ステータスの努力値（無振りの場合は0を想定）
    hp: int = Field(0, description="HP努力値")
    attack: int = Field(0, description="攻撃努力値")
    defense: int = Field(0, description="防御努力値")
    sp_attack: int = Field(0, description="特攻努力値")
    sp_defense: int = Field(0, description="特防努力値")
    speed: int = Field(0, description="素早さ努力値")
    
    is_minor: bool = Field(False, description="マイナーな調整（その他枠など）かどうか")

    class Config:
        from_attributes = True  # ORMや辞書からのマッピングを許可（Pydantic v2）

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
    season_evs: list[SeasonEvInfo] = Field(default_factory=list, description="努力値調整ランキング情報")
    max_power_times_atk_by_type: Dict[str, int]
    type_efficacies: Dict[str, float]


class PokemonListItem(BaseModel):
    """サジェスト候補表示用の軽量スキーマ"""
    pokemon_id: int
    name: str
    english_name: str
    image_url: Optional[str] = None
    
