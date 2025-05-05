"""
CSVアップロードと解析API

このモジュールは、CSVファイルをアップロードして解析するためのAPIエンドポイントを提供します。
アップロードされたCSVファイルはメモリ上で処理され、解析結果がレスポンスとして返されます。
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from app.services.csv_parser import CSVParserService
from app.models.portfolio import CSVUploadResponse, PortfolioData

# ロガーの設定
logger = logging.getLogger(__name__)

# ルーターの設定
# main.pyで/apiプレフィックスが追加されるため、ここでは/csvのみを指定
router = APIRouter(
    prefix="/csv",
    tags=["csv"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"}
    },
)

# CSVパーサーサービスのインスタンス取得
def get_csv_parser_service():
    """CSVパーサーサービスのインスタンスを取得する依存関数"""
    return CSVParserService()


@router.post(
    "/upload",
    response_model=CSVUploadResponse,
    summary="CSVファイルのアップロードと解析",
    description="証券会社のCSVファイルをアップロードして解析し、ポートフォリオデータを返します。"
)
async def upload_csv(
    file: UploadFile = File(...),
    csv_parser: CSVParserService = Depends(get_csv_parser_service)
):
    """
    CSVファイルをアップロードして解析するエンドポイント
    
    Args:
        file: アップロードされたCSVファイル
        csv_parser: CSVパーサーサービスのインスタンス
        
    Returns:
        解析結果レスポンス
    """
    try:
        # ファイル形式の検証
        if not file.filename.endswith('.csv'):
            logger.warning(f"無効なファイル形式: {file.filename}")
            return CSVUploadResponse(
                success=False,
                message="CSVファイル以外はアップロードできません。",
                error="Invalid file format"
            )
            
        # ファイルの読み込み
        contents = await file.read()
        
        # ファイルサイズの検証
        if len(contents) > 5 * 1024 * 1024:  # 5MB制限
            logger.warning(f"ファイルサイズ超過: {len(contents)} bytes")
            return CSVUploadResponse(
                success=False,
                message="ファイルサイズは5MB以下にしてください。",
                error="File too large"
            )
            
        # CSVのパース
        try:
            # まずUTF-8で試行
            result = csv_parser.parse_csv_file(contents, encoding='utf-8')
        except UnicodeDecodeError:
            # UTF-8で失敗した場合はShift-JISで再試行
            try:
                result = csv_parser.parse_csv_file(contents, encoding='shift-jis')
            except Exception as e:
                logger.error(f"CSVパースエラー: {str(e)}")
                return CSVUploadResponse(
                    success=False,
                    message="CSVファイルの解析に失敗しました。ファイル形式を確認してください。",
                    error=str(e)
                )
        except Exception as e:
            logger.error(f"CSVパースエラー: {str(e)}")
            return CSVUploadResponse(
                success=False,
                message="CSVファイルの解析に失敗しました。データ形式を確認してください。",
                error=str(e)
            )
            
        # PortfolioDataモデルに変換
        portfolio_data = PortfolioData(
            broker_type=result['broker_type'],
            items=result['items'],
            summary=result['summary']
        )
        
        # 成功レスポンスを返す
        return CSVUploadResponse(
            success=True,
            message="CSVファイルの解析に成功しました。",
            data=portfolio_data
        )
        
    except Exception as e:
        # 予期しないエラーの処理
        logger.error(f"予期しないエラー: {str(e)}")
        return CSVUploadResponse(
            success=False,
            message="予期しないエラーが発生しました。サポートにお問い合わせください。",
            error=str(e)
        )


@router.get(
    "/sample",
    response_model=CSVUploadResponse,
    summary="サンプルポートフォリオデータの取得",
    description="テスト・デモ用のサンプルポートフォリオデータを取得します。"
)
async def get_sample_portfolio(
    csv_parser: CSVParserService = Depends(get_csv_parser_service)
):
    """
    サンプルポートフォリオデータを返すエンドポイント
    
    Args:
        csv_parser: CSVパーサーサービスのインスタンス
        
    Returns:
        サンプルポートフォリオデータのレスポンス
    """
    try:
        # サンプルCSVファイルを読み込む
        import os
        sample_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            'samples',
            'sample_portfolio.csv'
        )
        
        with open(sample_path, 'rb') as f:
            contents = f.read()
            
        # CSVのパース
        result = csv_parser.parse_csv_file(contents)
        
        # PortfolioDataモデルに変換
        portfolio_data = PortfolioData(
            broker_type='sample',
            items=result['items'],
            summary=result['summary']
        )
        
        # 成功レスポンスを返す
        return CSVUploadResponse(
            success=True,
            message="サンプルポートフォリオデータを取得しました。",
            data=portfolio_data
        )
        
    except Exception as e:
        # エラーの処理
        logger.error(f"サンプルデータ取得エラー: {str(e)}")
        return CSVUploadResponse(
            success=False,
            message="サンプルデータの取得に失敗しました。",
            error=str(e)
        )