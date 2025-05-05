"""
APIルーティング

このモジュールは、APIエンドポイントのルーティングを統合して管理します。
アプリケーションの全てのAPIルートがここで登録されます。
"""
from fastapi import APIRouter

from app.api.csv import router as csv_router
from app.api.gpt import router as gpt_router  # 新しいGPTルーターのインポート

# メインルーター
api_router = APIRouter()

# 各モジュールのルーターを登録
api_router.include_router(csv_router)
api_router.include_router(gpt_router)  # GPTルーターを登録

# 後で他のルーターが追加される可能性があります
# api_router.include_router(portfolio_router)
