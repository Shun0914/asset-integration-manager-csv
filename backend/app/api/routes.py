"""
APIルーティング

このモジュールは、APIエンドポイントのルーティングを統合して管理します。
アプリケーションの全てのAPIルートがここで登録されます。
"""
from fastapi import APIRouter

from app.api.csv import router as csv_router

# メインルーター
api_router = APIRouter()

# 各モジュールのルーターを登録
api_router.include_router(csv_router)

# 後で他のルーターが追加される可能性があります
# api_router.include_router(portfolio_router)
# api_router.include_router(gpt_router)
