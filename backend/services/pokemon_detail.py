"""
単体ポケモンの詳細情報取得サービス。

元の `services/pokemon.py` の `fetch_pokemon_data` を切り出したもの。
ロジック自体は変更していないが、以下の点を整理した:
- 共通定数・ヘルパーは pokemon_common.py に集約
- 技情報の整形処理を `_build_move_detail` として関数化し、可読性を向上
"""
from __future__ import annotations

import asyncio

import httpx
from async_lru import alru_cache
from fastapi import HTTPException

from core.config import settings
from schemas.pokemon import PokemonInfo, PokemonMoveDetail

from .pokemon_common import (
    DAMAGE_CLASS_ENG_TO_JA,
    DEFAULT_TIMEOUT,
    POKEAPI_BASE_URL,
    TYPE_ENG_TO_JA,
    get_localized_name,
    resolve_pokemon_id_by_japanese_name,
)


def _build_move_detail(move_json: dict, lang: str) -> PokemonMoveDetail:
    """PokeAPIの技レスポンス1件を PokemonMoveDetail に整形する。"""
    name = get_localized_name(move_json.get("names", []), lang, move_json.get("name"))

    type_eng = move_json.get("type", {}).get("name", "")
    type_ja = TYPE_ENG_TO_JA.get(type_eng, type_eng)

    damage_class_eng = move_json.get("damage_class", {}).get("name", "")
    damage_class_ja = DAMAGE_CLASS_ENG_TO_JA.get(damage_class_eng, damage_class_eng)

    return PokemonMoveDetail(
        name=name,
        type=type_ja,
        power=move_json.get("power"),
        accuracy=move_json.get("accuracy"),
        damage_class=damage_class_ja,
    )


@alru_cache(maxsize=256)
async def fetch_pokemon_data(name_or_id: str) -> PokemonInfo:
    """
    ポケモン詳細情報を取得する。

    name_or_id がASCIIの数字・英字であればPokeAPIのID/英語名としてそのまま使用し、
    そうでなければ日本語名としてGraphQL経由でIDを逆引きする。
    """
    lang = settings.TARGET_LANGUAGE
    query = str(name_or_id).lower().strip()

    if not query.isdigit() and not query.isascii():
        poke_id = await resolve_pokemon_id_by_japanese_name(name_or_id)
        query = str(poke_id)

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        try:
            pokemon_res = await client.get(f"{POKEAPI_BASE_URL}pokemon/{query}")
            pokemon_res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                raise HTTPException(
                    status_code=404, detail=f"'{name_or_id}' は見つかりませんでした。"
                )
            raise HTTPException(status_code=502, detail="PokeAPIエラー")
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"PokeAPIサーバーに接続できません: {exc}"
            )

        pokemon_data = pokemon_res.json()
        base_name = pokemon_data.get("name")
        poke_id = pokemon_data.get("id")

        base_stats = {
            stat["stat"]["name"]: stat["base_stat"] for stat in pokemon_data.get("stats", [])
        }
        move_entries = pokemon_data.get("moves", [])
        move_urls = [m["move"]["url"] for m in move_entries]

        species_url = f"{POKEAPI_BASE_URL}pokemon-species/{poke_id}"
        type_urls = [t["type"]["url"] for t in pokemon_data.get("types", [])]
        ability_urls = [a["ability"]["url"] for a in pokemon_data.get("abilities", [])]

        requests = (
            [client.get(species_url)]
            + [client.get(url) for url in type_urls]
            + [client.get(url) for url in ability_urls]
            + [client.get(url) for url in move_urls]
        )

        try:
            responses = await asyncio.gather(*requests)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"PokeAPIサーバー(詳細データ)に接続できません: {exc}",
            )

        species_res = responses[0]
        type_responses = responses[1 : 1 + len(type_urls)]
        ability_responses = responses[
            1 + len(type_urls) : 1 + len(type_urls) + len(ability_urls)
        ]
        move_responses = responses[1 + len(type_urls) + len(ability_urls) :]

        localized_name = base_name
        english_name = base_name
        localized_types: list[str] = []
        localized_abilities: list[str] = []
        localized_moves: list[PokemonMoveDetail] = []

        if species_res.status_code == 200:
            names_list = species_res.json().get("names", [])
            localized_name = get_localized_name(names_list, lang, base_name)
            english_name = get_localized_name(names_list, "en", base_name)

        for type_res in type_responses:
            if type_res.status_code == 200:
                t_data = type_res.json()
                localized_types.append(
                    get_localized_name(t_data.get("names", []), lang, t_data.get("name"))
                )

        for ability_res in ability_responses:
            if ability_res.status_code == 200:
                a_data = ability_res.json()
                localized_abilities.append(
                    get_localized_name(a_data.get("names", []), lang, a_data.get("name"))
                )

        for move_res in move_responses:
            if move_res.status_code == 200:
                localized_moves.append(_build_move_detail(move_res.json(), lang))

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
            moves=localized_moves,
            image_url=pokemon_data.get("sprites", {}).get("front_default"),
        )