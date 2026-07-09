// schemas/party.py と同期する型
export interface PartyMember {
    build_id: string;
    slot_index: number;
}

export interface PartyCreateRequest {
    name: string;
    description?: string;
    members: PartyMember[];
}

export interface PartyResponse extends PartyCreateRequest {
    id: string;
    created_at?: string;
}