# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import status, damage, pokemon, type_matchup, builds, parties, battles, seasons, strategy,sync
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# CORS設定（Next.jsからの通信を許可する設定）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターをFastAPIアプリに登録する
app.include_router(status.router, prefix=f"{settings.API_PREFIX}/status", tags=["status"])
app.include_router(damage.router, prefix=f"{settings.API_PREFIX}/damage", tags=["damage"])
app.include_router(pokemon.router, prefix=f"{settings.API_PREFIX}/pokemon", tags=["pokemon"])
app.include_router(type_matchup.router, prefix=f"{settings.API_PREFIX}/type_matchup", tags=["type_matchup"])
app.include_router(builds.router, prefix=f"{settings.API_PREFIX}/builds", tags=["builds"])
app.include_router(parties.router, prefix=f"{settings.API_PREFIX}/parties", tags=["parties"])
app.include_router(battles.router)
app.include_router(seasons.router, prefix=f"{settings.API_PREFIX}/seasons", tags=["seasons"])
app.include_router(strategy.router, prefix=f"{settings.API_PREFIX}/strategy", tags=["strategy"])
app.include_router(sync.router, prefix=f"{settings.API_PREFIX}/sync", tags=["sync"])

# サーバーが動いているか確認するためのルート
@app.get("/")
def read_root():
    return {"message": "Zero-Lab Backend is running!"}