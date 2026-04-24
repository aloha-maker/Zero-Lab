from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class PokemonInfo(BaseModel):
    id: int
    name: str                   
    english_name: str           
    types: List[str]            
    abilities: List[str]        
    base_stats: Dict[str, int]  
    weight_kg: float            
    height_m: float             
    moves: List[str]            
    image_url: Optional[str] = None