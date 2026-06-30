// # ⑤ アプリ全体で共有するグローバルな型定義
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ApiErrorResponse {
    detail: string | ApiValidationError[];
}
