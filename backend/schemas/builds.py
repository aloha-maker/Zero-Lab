from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class PokemonBuildBase(BaseModel):
    pokemon_id: int
    pokemon_name: str
    nickname: Optional[str] = ""
    nature: str
    ability: str
    item: str
    tera_type: str
    moves: List[str] = Field(default_factory=list, max_items=4)
    evs: Dict[str, int] = Field(default_factory=lambda: {"H":0, "A":0, "B":0, "C":0, "D":0, "S":0})
    ivs: Dict[str, int] = Field(default_factory=lambda: {"H":31, "A":31, "B":31, "C":31, "D":31, "S":31})
    memo: Optional[str] = ""

class PokemonBuildCreate(PokemonBuildBase):
    pass

class PokemonBuildResponse(PokemonBuildBase):
    id: str

class BuildSummary(BaseModel):
    id: str
    pokemon_id: int
    pokemon_name: str