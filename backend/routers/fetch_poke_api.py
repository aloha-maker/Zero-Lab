from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import List, Optional, Dict
import httpx
import os
import asyncio

# ルーターの初期化
router = APIRouter()

# PokeAPIのベースURL
POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"

# 環境変数から言語設定を取得（デフォルトは英語: "en"、日本語漢字は "ja"、カタカナは "ja-Hrkt"）
TARGET_LANGUAGE = os.getenv("POKEAPI_LANGUAGE", "ja") 

# フロントエンドに返すデータの型定義
class PokemonInfo(BaseModel):
    id: int
    name: str                   # 環境変数で指定された言語のポケモンの名前
    english_name: str           # ポケモンの英語名（常に取得）
    types: List[str]            # ローカライズされたタイプ
    abilities: List[str]        # ローカライズされた特性（通常・夢特性含む）
    base_stats: Dict[str, int]  # 種族値（hp, attack, defense, special-attack, special-defense, speed）
    weight_kg: float            # 体重(kg)
    height_m: float             # 高さ(m)
    moves: List[str]            # 覚える技のリスト（英語の内部名）
    image_url: Optional[str] = None

def get_localized_name(names_list: list, target_lang: str, default_name: str) -> str:
    """
    PokeAPIの 'names' リストから指定された言語の名前を抽出するヘルパー関数
    """
    for name_entry in names_list:
        if name_entry["language"]["name"] == target_lang:
            return name_entry["name"]
    return default_name

@router.get("/api/pokemon/{name_or_id}", response_model=PokemonInfo)
async def get_pokemon(
    name_or_id: str = Path(..., description="検索したいポケモンの英語名または図鑑番号")
):
    query = name_or_id.lower()
    
    async with httpx.AsyncClient() as client:
        # 1. 基本的なポケモン情報の取得
        try:
            pokemon_res = await client.get(f"{POKEAPI_BASE_URL}pokemon/{query}")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"PokeAPIとの通信エラー: {exc}")

        if pokemon_res.status_code == 404:
            raise HTTPException(status_code=404, detail=f"'{name_or_id}' は見つかりませんでした。")
        elif pokemon_res.status_code != 200:
            raise HTTPException(status_code=pokemon_res.status_code, detail="予期せぬレスポンス")

        pokemon_data = pokemon_res.json()
        base_name = pokemon_data.get("name") # API上の内部名 (例: charizard)
        poke_id = pokemon_data.get("id")

        # バトル用データの抽出
        base_stats = {stat["stat"]["name"]: stat["base_stat"] for stat in pokemon_data.get("stats", [])}
        moves = [move["move"]["name"] for move in pokemon_data.get("moves", [])]

        # 言語データ取得のためのURLリストを作成
        species_url = f"{POKEAPI_BASE_URL}pokemon-species/{poke_id}"
        type_urls = [t["type"]["url"] for t in pokemon_data.get("types", [])]
        ability_urls = [a["ability"]["url"] for a in pokemon_data.get("abilities", [])]

        # 種族名、タイプ、特性のローカライズデータを一気に並行取得
        requests = [client.get(species_url)] + \
                   [client.get(url) for url in type_urls] + \
                   [client.get(url) for url in ability_urls]
        
        responses = await asyncio.gather(*requests)

        # レスポンスの分割
        species_res = responses[0]
        type_responses = responses[1:1+len(type_urls)]
        ability_responses = responses[1+len(type_urls):]

        # 変数の初期化
        localized_name = base_name
        english_name = base_name
        localized_types = []
        localized_abilities = []

        # ポケモンの名前（指定言語名と英語名を両方取得）
        if species_res.status_code == 200:
            names_list = species_res.json().get("names", [])
            # 環境変数で指定された言語名を取得
            localized_name = get_localized_name(names_list, TARGET_LANGUAGE, base_name)
            # 常に英語名を取得
            english_name = get_localized_name(names_list, "en", base_name)
        
        # タイプのローカライズ
        for type_res in type_responses:
            if type_res.status_code == 200:
                t_data = type_res.json()
                localized_types.append(get_localized_name(t_data.get("names", []), TARGET_LANGUAGE, t_data.get("name")))
        
        # 特性のローカライズ
        for ability_res in ability_responses:
            if ability_res.status_code == 200:
                a_data = ability_res.json()
                localized_abilities.append(get_localized_name(a_data.get("names", []), TARGET_LANGUAGE, a_data.get("name")))

        weight_kg = pokemon_data.get("weight", 0) / 10.0
        height_m = pokemon_data.get("height", 0) / 10.0

        return PokemonInfo(
            id=poke_id,
            name=localized_name,
            english_name=english_name,
            types=localized_types,
            abilities=localized_abilities,
            base_stats=base_stats,
            weight_kg=weight_kg,
            height_m=height_m,
            moves=moves,
            image_url=pokemon_data.get("sprites", {}).get("front_default")
        )