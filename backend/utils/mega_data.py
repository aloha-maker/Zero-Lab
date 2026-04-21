# 主要なメガストーンとPokeAPI名のマッピング
MEGA_STONE_MAP = {
    "リザードナイトX": "charizard-mega-x",
    "リザードナイトY": "charizard-mega-y",
    "ミュウツナイトX": "mewtwo-mega-x",
    "ミュウツナイトY": "mewtwo-mega-y",
    "ゲンガナイト": "gengar-mega",
    # 他のメガストーンも同様に追加
}

def get_mega_pokemon_name(base_name: str, item_name: str) -> str | None:
    """ベースのポケモン名と持ち物から、メガシンカ後のPokeAPI用名前を返す"""
    # 実際にはリザードンのように複数あるケースがあるため、アイテム名で判定
    return MEGA_STONE_MAP.get(item_name)