from pydantic import BaseModel

class ScrapeMovesRequest(BaseModel):
    pokemon_id: int
    url: str

class ScrapeStatsRequest(BaseModel):
    pokemon_id: int
    url: str