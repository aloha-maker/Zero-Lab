"""
Supabaseクライアントの依存性注入(DI)モジュール。

従来は各サービス関数内で `create_client(...)` を都度呼び出していたが、
- 接続生成オーバーヘッドが関数呼び出しごとに発生する
- テスト時にモックへ差し替えにくい
という問題があったため、FastAPIの `Depends` を通じて注入する方式に変更した。

ルーター側では以下のように利用する:

    from fastapi import Depends
    from core.supabase import get_supabase, SupabaseClient

    @router.get("/pokemon/list")
    async def list_pokemon(supabase: SupabaseClient = Depends(get_supabase)):
        return await get_all_pokemon_list()

    @router.get("/pokemon/rule/{rule_id}")
    async def list_by_rule(rule_id: int, supabase: SupabaseClient = Depends(get_supabase)):
        return await get_pokemon_list_by_rule(rule_id, supabase)
"""
from __future__ import annotations

import os
from functools import lru_cache

from supabase import Client, create_client

# 型エイリアス。サービス層の引数アノテーションを簡潔にするため。
SupabaseClient = Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")


@lru_cache(maxsize=1)
def _build_client() -> SupabaseClient:
    """
    Supabaseクライアントをプロセス内で1度だけ生成し、以後は再利用する。

    supabase-py の Client はステートレスなHTTPクライアントのラッパーであり、
    リクエストごとに作り直す必要はないため lru_cache でシングルトン化している。
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_KEY が環境変数に設定されていません。"
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> SupabaseClient:
    """FastAPIの Depends から呼び出されるプロバイダ関数。"""
    return _build_client()