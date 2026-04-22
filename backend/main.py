from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 作成したルーター（部品）を読み込む
from routers import status, damage,fetch_poke_api,type_matchup,builds,party

app = FastAPI()

# CORS設定（Next.jsからの通信を許可する設定）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターをFastAPIアプリに登録する
app.include_router(status.router)
app.include_router(damage.router)
app.include_router(fetch_poke_api.router)
app.include_router(type_matchup.router)
app.include_router(builds.router)
app.include_router(party.router)

# サーバーが動いているか確認するためのルート（無くてもOKですがあると便利です）
@app.get("/")
def read_root():
    return {"message": "Zero-Lab Backend is running!"}