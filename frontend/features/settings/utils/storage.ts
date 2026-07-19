// frontend/features/settings/utils/storage.ts
const KEY = "POKEMON_SYNC_API_KEY";

export function getApiKey() {
    return localStorage.getItem(KEY) ?? "";
}

export function saveApiKey(key: string) {
    localStorage.setItem(KEY, key);
}