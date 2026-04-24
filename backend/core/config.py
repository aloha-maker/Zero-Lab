# backend/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # APIの基本設定など、ガイドラインにあるプレフィックス等もここで管理すると良いです
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Zero-Lab Pokemon API"
    
    # PokeAPIの言語設定
    # デフォルト値を設定しない場合は環境変数がないと起動時にエラーになります（Fail Fast）
    TARGET_LANGUAGE: str = "ja-Hrkt" 
    
    # .env ファイルからの読み込み設定
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # 未定義の環境変数を無視する
    )

# シングルトンとしてインスタンス化し、アプリ全体で使い回す
settings = Settings()