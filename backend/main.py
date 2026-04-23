from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 作成したルーター（部品）を読み込む
from routers import status, damage,pokemon,type_matchup,builds,parties

app = FastAPI(title="Zero-Lab API", version="1.0.0")

# CORS設定（Next.jsからの通信を許可する設定）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターをFastAPIアプリに登録する
api_prefix = "/api/v1"
app.include_router(status.router, prefix=f"{api_prefix}/status", tags=["status"])
app.include_router(damage.router, prefix=f"{api_prefix}/damage", tags=["damage"])
app.include_router(pokemon.router, prefix=f"{api_prefix}/pokemon", tags=["pokemon"])
app.include_router(type_matchup.router, prefix=f"{api_prefix}/type_matchup", tags=["type_matchup"])
app.include_router(builds.router, prefix=f"{api_prefix}/builds", tags=["builds"])
app.include_router(parties.router, prefix=f"{api_prefix}/parties", tags=["parties"])

# サーバーが動いているか確認するためのルート（無くてもOKですがあると便利です）
@app.get("/")
def read_root():
    return {"message": "Zero-Lab Backend is running!"}