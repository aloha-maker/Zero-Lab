# backend/schemas/party.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional

class PartyMemberSchema(BaseModel):
    build_id: str = Field(..., description="pokemon_buildsテーブルのUUID")
    slot_index: int = Field(..., ge=1, le=6, description="配置スロット(1〜6)")

class PartyCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    members: List[PartyMemberSchema]

    @validator('members')
    def validate_members(cls, members):
        if len(members) > 6:
            raise ValueError('パーティメンバーは最大6匹までです。')
        
        slots = [m.slot_index for m in members]
        if len(slots) != len(set(slots)):
            raise ValueError('スロット番号(slot_index)に重複があります。')
        return members