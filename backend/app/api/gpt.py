"""
GPTアドバイスAPIエンドポイント

このモジュールは、ポートフォリオデータに基づいたGPTアドバイスを提供するAPIエンドポイントを定義します。
OpenAI APIを利用して分析結果とアドバイスを生成します。
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional

from ..models.portfolio import GPTAdviceRequest, GPTAdviceResponse
from ..services.gpt_service import GPTService

# ルーターの作成
router = APIRouter(prefix="/gpt", tags=["gpt"])

# GPTサービスのインスタンスを取得する関数
def get_gpt_service() -> GPTService:
    """
    GPTサービスのインスタンスを取得
    
    Returns:
        GPTServiceのインスタンス
    """
    try:
        return GPTService()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPTサービスの初期化に失敗しました: {str(e)}")

@router.post("/advice", response_model=GPTAdviceResponse)
async def get_portfolio_advice(
    request: GPTAdviceRequest,
    gpt_service: GPTService = Depends(get_gpt_service)
) -> Dict[str, Any]:
    """
    ポートフォリオデータに基づいてGPTアドバイスを取得するエンドポイント
    
    Args:
        request: GPTアドバイスリクエスト（ポートフォリオデータとオプションのカスタムプロンプトを含む）
        gpt_service: GPTサービスのインスタンス
        
    Returns:
        アドバイステキストを含むレスポンス
    """
    try:
        # モデルを設定（リクエストで指定がある場合）
        if request.model:
            gpt_service.set_model(request.model)
        
        # アドバイスを取得
        result = gpt_service.get_advice(
            portfolio_data=request.portfolio_data.dict(),
            custom_prompt=request.custom_prompt
        )
        
        # 結果がエラーの場合
        if not result.get("success", False):
            return {
                "success": False,
                "error": result.get("error", "不明なエラーが発生しました。"),
                "timestamp": result.get("timestamp")
            }
        
        # 成功の場合はレスポンスを返す
        return {
            "success": True,
            "advice": result.get("advice"),
            "model": result.get("model"),
            "timestamp": result.get("timestamp")
        }
        
    except Exception as e:
        # 例外が発生した場合はエラーレスポンスを返す
        return {
            "success": False,
            "error": f"GPTアドバイスの取得に失敗しました: {str(e)}",
            "timestamp": None
        }
