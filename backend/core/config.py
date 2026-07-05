# backend/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # APIの基本設定など
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Zero-Lab Pokemon API"
    
    # PokeAPIの言語設定
    TARGET_LANGUAGE: str = "ja-Hrkt" 
    
    # --- 同期バッチ用の設定を追加 ---
    # .env で設定されなかった場合のデフォルト値（テスト用）
    SYNC_API_KEY_HEADER: str = "X-API-Key"
    SYNC_API_KEY: str = "your-secret-api-key-here" 
    POKEAPI_GRAPHQL_URL: str = "https://graphql.pokeapi.co/v1beta2"
    
    # .env ファイルからの読み込み設定
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # 未定義の環境変数を無視する
    )

# シングルトンとしてインスタンス化し、アプリ全体で使い回す
settings = Settings()