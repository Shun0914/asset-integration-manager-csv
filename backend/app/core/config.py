"""
アプリケーション設定

このモジュールでは、アプリケーションの環境設定を管理します。
環境変数の読み込みや各種設定値の定義を行います。
"""
import os
from typing import Dict, Any, Optional, List
# Pydantic 2.xに対応するため、インポート文を更新
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# 実行環境
class Environment:
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"


class Settings(BaseSettings):
    """アプリケーション設定クラス"""
    
    # アプリケーション基本設定
    APP_NAME: str = "Asset Integration Manager API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "CSV形式のポートフォリオデータを解析・分析するAPIサービス"
    DEBUG: bool = False
    
    # 環境設定
    ENVIRONMENT: str = Environment.DEVELOPMENT
    
    # CORS設定
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # セキュリティ設定
    API_MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    # ロギング設定
    LOG_LEVEL: str = "INFO"
    
    # OpenAI API設定 (後で使用)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # Pydantic 2.xでの設定方法
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @field_validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """環境設定の検証"""
        allowed = [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.TESTING]
        if v not in allowed:
            raise ValueError(f"Environment must be one of {', '.join(allowed)}")
        return v


# 設定インスタンスの作成
settings = Settings()