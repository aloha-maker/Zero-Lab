// src/lib/api-client.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_PREFIX = "/api/v1";

export interface ApiValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ApiErrorResponse {
    detail: string | ApiValidationError[];
}


/**
 * カスタムエラークラス
 * ステータスコードやバックエンドからの詳細なエラーメッセージを保持します
 */
export class ApiError extends Error {
    public status: number;
    public details?: any;

    constructor(message: string, status: number, details?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

/**
 * 共通のFetchラッパー関数
 */
async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // スラッシュの重複を防ぐためのフォーマット
    const url = `${API_URL}${API_PREFIX}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const defaultHeaders = {
        "Content-Type": "application/json",
        // 必要に応じて認証トークンなどをここで一括付与します
        // "Authorization": `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = "通信エラーが発生しました";
        let errorData: ApiErrorResponse | null = null;

        try {
            errorData = await response.json() as ApiErrorResponse;
        } catch (e) {
            // JSONのパースに失敗した場合（500エラーでHTMLが返ってきた場合など）
            throw new ApiError(`サーバーエラーが発生しました (${response.status})`, response.status);
        }

        // FastAPI等のエラーレスポンス形式に応じたメッセージの構築
        if (response.status === 404) {
            errorMessage = "指定されたリソースが見つかりませんでした";
        } else if (errorData && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
        } else if (errorData && Array.isArray(errorData.detail)) {
            // バリデーションエラー（422 Unprocessable Entityなど）の場合
            errorMessage = "入力内容に誤りがあります（" + errorData.detail.map(err => err.msg).join(", ") + "）";
        }

        throw new ApiError(errorMessage, response.status, errorData);
    }

    // 204 No Content などの空レスポンス対応
    if (response.status === 204) {
        return {} as T;
    }

    return response.json() as Promise<T>;
}

/**
 * メソッドごとのエイリアスをエクスポート
 */
export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) => 
        fetchClient<T>(endpoint, { ...options, method: "GET" }),
        
    post: <T>(endpoint: string, body: any, options?: RequestInit) => 
        fetchClient<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
        
    put: <T>(endpoint: string, body: any, options?: RequestInit) => 
        fetchClient<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
        
    delete: <T>(endpoint: string, options?: RequestInit) => 
        fetchClient<T>(endpoint, { ...options, method: "DELETE" }),
};