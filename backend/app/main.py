"""
Asset Integration Manager バックエンドメインファイル
FastAPIアプリケーションの設定とルーティングを行います
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.routes import api_router

# ロギングの設定
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# アプリケーションの初期化
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# APIルーターの登録
app.include_router(api_router)

# ルートエンドポイント
@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
