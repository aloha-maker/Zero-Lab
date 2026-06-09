import os
import yaml
from supabase import create_client, Client
from google import genai
from google.genai import types
from core.config import settings
from schemas.battle import BattleCreate, OpponentPokemonUpdate, BattleResultUpdate, BattleAdviceRequest, BattleAdviceResponse
from uuid import UUID

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


async def create_battle(battle_in: BattleCreate):
    # 1. battlesテーブルに対戦レコードを作成
    #    season_id が指定されている場合は合わせて保存する
    battle_data: dict = {"user_id": str(battle_in.user_id)}
    if battle_in.season_id is not None:
        battle_data["season_id"] = battle_in.season_id

    res_battle = supabase.table("battles").insert(battle_data).execute()

    battle_id = res_battle.data[0]["id"]

    # 2. 相手のパーティ6匹をインサート
    pokemons_data = []
    for p in battle_in.opponent_team:
        p_dict = p.model_dump(exclude_none=True)
        p_dict["battle_id"] = battle_id
        pokemons_data.append(p_dict)

    res_pokemons = supabase.table("battle_opponent_pokemons").insert(pokemons_data).execute()

    result_data = res_battle.data[0]
    result_data["opponent_pokemons"] = res_pokemons.data

    return result_data


async def upsert_opponent_pokemons(battle_id: UUID, pokemons: list[OpponentPokemonUpdate]):
    data_to_upsert = []
    for p in pokemons:
        p_dict = p.model_dump(exclude_none=True)
        p_dict["battle_id"] = str(battle_id)
        if p_dict.get("id"):
            p_dict["id"] = str(p_dict["id"])
        data_to_upsert.append(p_dict)

    res = supabase.table("battle_opponent_pokemons").upsert(
        data_to_upsert,
        on_conflict="battle_id,slot_order"
    ).execute()
    return res.data


async def update_battle_result(battle_id: UUID, result_in: BattleResultUpdate):
    res = supabase.table("battles").update({"result": result_in.result}).eq("id", str(battle_id)).execute()
    return res.data


class BattleAdviceService:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, "../prompts/battle_advice.yaml")

        with open(prompt_path, "r", encoding="utf-8") as f:
            self.prompt_config = yaml.safe_load(f)

    async def generate_advice(self, request_data: BattleAdviceRequest) -> BattleAdviceResponse:
        system_instruction = self.prompt_config.get("system_instruction")
        prompt_template = self.prompt_config.get("battle_analysis_prompt")

        user_prompt = prompt_template.format(
            rule="シングルバトル" if request_data.rule == "single" else "ダブルバトル",
            regulation=request_data.regulation,
            my_party=", ".join(request_data.my_party),
            enemy_party=", ".join(request_data.enemy_party)
        )

        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=BattleAdviceResponse,
                temperature=0.2,
            ),
        )

        return response.parsed