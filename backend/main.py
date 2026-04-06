from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math

app = FastAPI()

# フロントエンド(Next.js: ポート3000)からの通信を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 受け取るデータ（JSON）の設計図
class StatRequest(BaseModel):
    base: int     # 種族値
    iv: int       # 個体値
    ev: int       # 努力値
    level: int    # レベル

@app.get("/")
def read_root():
    return {"message": "Zero-Lab Backend is running!"}

@app.post("/api/calculate")
def calculate_stat(req: StatRequest):
    try:
        # HPの実数値計算式: {(種族値×2 ＋ 個体値 ＋ 努力値÷4) × レベル ÷ 100} ＋ レベル ＋ 10
        # ※各計算の段階で小数点以下は切り捨て(math.floor)
        step1 = math.floor(req.ev / 4)
        step2 = (req.base * 2) + req.iv + step1
        step3 = math.floor((step2 * req.level) / 100)
        hp_stat = step3 + req.level + 10
        
        return {
            "status": "success",
            "calculated_hp": hp_stat,
            "message": f"通信成功！計算されたHPの実数値は【 {hp_stat} 】です。"
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}