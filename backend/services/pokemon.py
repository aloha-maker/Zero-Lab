import httpx
import os
import asyncio
from fastapi import HTTPException
from async_lru import alru_cache
from schemas.pokemon import PokemonInfo
from core.config import settings

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"

# タイムアウトの設定 (接続に5秒、データ受信に10秒)
timeout = httpx.Timeout(10.0, connect=5.0)

def get_localized_name(names_list: list, target_lang: str, default_name: str) -> str:
    for name_entry in names_list:
        if name_entry["language"]["name"] == target_lang:
            return name_entry["name"]
    return default_name

# LRUキャッシュを利用して、同じポケモンに対する2回目以降の取得をメモリから返す (最大256件)
@alru_cache(maxsize=256)
async def fetch_pokemon_data(name_or_id: str) -> PokemonInfo:
    lang = settings.TARGET_LANGUAGE
    query = str(name_or_id).lower()
    
    # タイムアウトを設定したHTTPクライアントを利用
    async with httpx.AsyncClient(timeout=timeout) as client:
        # 1. 基本的なポケモン情報の取得
        try:
            pokemon_res = await client.get(f"{POKEAPI_BASE_URL}pokemon/{query}")
            pokemon_res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"'{name_or_id}' は見つかりませんでした。")
            raise HTTPException(status_code=exc.response.status_code, detail="PokeAPIエラー")
        except httpx.RequestError as exc:
            # タイムアウトやネットワークエラー時のフォールバック処理
            raise HTTPException(status_code=503, detail=f"PokeAPIサーバーに接続できません: {exc}")

        pokemon_data = pokemon_res.json()
        base_name = pokemon_data.get("name")
        poke_id = pokemon_data.get("id")

        base_stats = {stat["stat"]["name"]: stat["base_stat"] for stat in pokemon_data.get("stats", [])}
        moves = [move["move"]["name"] for move in pokemon_data.get("moves", [])]

        species_url = f"{POKEAPI_BASE_URL}pokemon-species/{poke_id}"
        type_urls = [t["type"]["url"] for t in pokemon_data.get("types", [])]
        ability_urls = [a["ability"]["url"] for a in pokemon_data.get("abilities", [])]

        requests = [client.get(species_url)] + \
                   [client.get(url) for url in type_urls] + \
                   [client.get(url) for url in ability_urls]
        
        try:
            responses = await asyncio.gather(*requests)
        except httpx.RequestError as exc:
             raise HTTPException(status_code=503, detail=f"PokeAPIサーバー(詳細データ)に接続できません: {exc}")

        species_res = responses[0]
        type_responses = responses[1:1+len(type_urls)]
        ability_responses = responses[1+len(type_urls):]

        localized_name = base_name
        english_name = base_name
        localized_types = []
        localized_abilities = []

        if species_res.status_code == 200:
            names_list = species_res.json().get("names", [])
            localized_name = get_localized_name(names_list, lang, base_name)
            english_name = get_localized_name(names_list, "en", base_name)
        
        for type_res in type_responses:
            if type_res.status_code == 200:
                t_data = type_res.json()
                localized_types.append(get_localized_name(t_data.get("names", []), lang, t_data.get("name")))
        
        for ability_res in ability_responses:
            if ability_res.status_code == 200:
                a_data = ability_res.json()
                localized_abilities.append(get_localized_name(a_data.get("names", []), lang, a_data.get("name")))

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