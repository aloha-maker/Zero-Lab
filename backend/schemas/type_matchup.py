from pydantic import BaseModel
from typing import List

class TypeMatchupRequest(BaseModel):
    attacker_type: str
    defender_types: List[str]

class TypeMatchupResponse(BaseModel):
    multiplier: float
    message: str