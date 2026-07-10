import { API_URL } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
import type { PartyResponse, PartyMember } from '../types';

// ★ バックエンドのレスポンスは以下の形で返ってくる（フロントの型とはズレがある）:
//   - members配列のキー名が `party_members`
//   - 育成データ(pokemon_name, item, evs...)が `pokemon_builds` にネストされている
// ここで一括してフロント側の PartyResponse 形式にフラット化する
const normalizeParty = (raw: any): PartyResponse => {
    const members: PartyMember[] = (raw.party_members ?? []).map((pm: any) => ({
        build_id: pm.build_id,
        slot_index: pm.slot_index,
        ...(pm.pokemon_builds ?? {}), // pokemon_name, item, ability, evs, ivs, moves などをフラットに展開
    }));

    return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        created_at: raw.created_at,
        members,
    };
};

export const getPartyDetail = async (id: string): Promise<PartyResponse | null> => {
    const res = await fetch(`${API_URL}/api/v1/parties/${id}`);

    if (!res.ok) {
        throw new ApiError(`パーティ情報の取得に失敗しました: ${res.statusText}`, 0);
    }

    const json = await res.json();
    console.log("Fetched Data:", json);

    if (json.status === "success") {
        return normalizeParty(json.data);
    }

    return null;
};