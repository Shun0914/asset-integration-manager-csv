"""
ポートフォリオデータのモデル定義

このモジュールでは、CSVから読み込んだポートフォリオデータを表現するための
Pydanticモデルを定義しています。これらのモデルは、APIレスポンスの形式を
標準化し、型の検証を行うために使用されます。
"""
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any
from datetime import date
from enum import Enum  # 追加: Enumクラスのインポート


class MarketEnum(str, Enum):
    """市場区分の列挙型"""
    # 日本市場
    TOPIX_PRIME = "東証プライム"
    TOPIX_STANDARD = "東証スタンダード"
    TOPIX_GROWTH = "東証グロース"
    JASDAQ = "JASDAQ"
    MOTHERS = "マザーズ"
    OTHER = "その他"
    # 米国市場
    NYSE = "NYSE"
    NASDAQ = "NASDAQ"
    AMEX = "AMEX"
    OTC = "OTC"
    ARCA = "Arca"  # 追加：NYSE Arca取引所
    CBOE = "CBOE"  # 追加：シカゴ・オプション取引所
    BATS = "BATS"  # 追加：BATS取引所
    IEX = "IEX"    # 追加：IEX取引所
    US_OTHER = "US_OTHER"


class SectorEnum(str, Enum):
    """業種セクターの列挙型"""
    AUTOMOTIVE = "自動車・輸送機"
    IT_TELECOM = "情報・通信"
    FINANCE = "銀行・金融"
    ELECTRONICS = "電気機器"
    SERVICE = "サービス"
    FOOD = "食品"
    PHARMA = "医薬品"
    RETAIL = "小売"
    CONSTRUCTION = "建設・不動産"
    ENERGY = "エネルギー"
    MATERIALS = "素材・化学"
    MACHINERY = "機械"
    OTHER = "その他"


class StockItem(BaseModel):
    """個別銘柄データのモデル"""
    code: str = Field(..., description="証券コード")
    name: str = Field(..., description="銘柄名")
    market: Optional[MarketEnum] = Field(None, description="市場区分")
    sector: Optional[SectorEnum] = Field(None, description="業種セクター")
    quantity: float = Field(..., description="保有数量")
    cost_price: float = Field(..., description="取得単価")
    current_price: float = Field(..., description="現在価格")
    value: float = Field(..., description="評価額（数量×現在価格）")
    profit_loss: float = Field(..., description="損益（評価額-取得価額）")
    profit_loss_rate: float = Field(..., description="損益率（%）")
    currency: str = Field("JPY", description="通貨単位")
    acquisition_date: Optional[date] = Field(None, description="取得日")
    dividend_yield: Optional[float] = Field(None, description="配当利回り（%）")

    @validator('code')
    def validate_code(cls, v):
        """証券コードの検証"""
        # 以下のいずれかにマッチすればOK
        # 1. 数字のみで構成され、4〜5桁である（日本株の証券コード）
        # 2. アルファベットと数字で構成され、1〜5文字である（米国株のティッカーシンボル）
        is_jp_code = v.isdigit() and (4 <= len(v) <= 5)
        is_us_ticker = v.isalnum() and (1 <= len(v) <= 5)
        
        if not (is_jp_code or is_us_ticker):
            raise ValueError('証券コードは4〜5桁の数字（日本株）または1〜5文字の英数字（米国株）である必要があります')
        return v

    @validator('profit_loss_rate')
    def validate_profit_loss_rate(cls, v):
        """損益率の範囲を検証"""
        # 極端な値をチェック
        if v > 1000 or v < -100:
            raise ValueError('損益率が範囲外です（-100%〜1000%）')
        return v


class SectorAllocation(BaseModel):
    """セクター別配分のモデル"""
    sector: str = Field(..., description="セクター名")
    value: float = Field(..., description="評価額")
    percentage: float = Field(..., description="構成比率（%）")


class PortfolioSummary(BaseModel):
    """ポートフォリオサマリー情報のモデル"""
    total_value: float = Field(..., description="総評価額")
    total_cost: float = Field(..., description="総取得価額")
    total_profit_loss: float = Field(..., description="総損益")
    total_profit_loss_rate: float = Field(..., description="総損益率（%）")
    number_of_stocks: int = Field(..., description="銘柄数")
    profitable_stocks: int = Field(..., description="利益が出ている銘柄数")
    unprofitable_stocks: int = Field(..., description="損失が出ている銘柄数")
    breakeven_stocks: int = Field(..., description="損益がゼロの銘柄数")
    sector_allocation: Optional[Dict[str, float]] = Field(None, description="セクター別構成比")


class PortfolioData(BaseModel):
    """ポートフォリオデータ全体のモデル"""
    broker_type: str = Field(..., description="証券会社タイプ")
    items: List[StockItem] = Field(..., description="保有銘柄リスト")
    summary: PortfolioSummary = Field(..., description="ポートフォリオサマリー")

    class Config:
        schema_extra = {
            "example": {
                "broker_type": "standard",
                "items": [
                    {
                        "code": "7203",
                        "name": "トヨタ自動車",
                        "market": "東証プライム",
                        "sector": "自動車・輸送機",
                        "quantity": 100,
                        "cost_price": 2500,
                        "current_price": 3200,
                        "value": 320000,
                        "profit_loss": 70000,
                        "profit_loss_rate": 28.0,
                        "currency": "JPY",
                        "acquisition_date": "2023-01-15",
                        "dividend_yield": 2.5
                    }
                ],
                "summary": {
                    "total_value": 320000,
                    "total_cost": 250000,
                    "total_profit_loss": 70000,
                    "total_profit_loss_rate": 28.0,
                    "number_of_stocks": 1,
                    "profitable_stocks": 1,
                    "unprofitable_stocks": 0,
                    "breakeven_stocks": 0,
                    "sector_allocation": {
                        "自動車・輸送機": 320000
                    }
                }
            }
        }


class CSVUploadResponse(BaseModel):
    """CSVアップロード結果レスポンスのモデル"""
    success: bool = Field(..., description="処理の成功可否")
    message: str = Field(..., description="処理結果メッセージ")
    data: Optional[PortfolioData] = Field(None, description="解析結果データ")
    error: Optional[str] = Field(None, description="エラーメッセージ（失敗時）")
