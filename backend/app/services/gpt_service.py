"""
GPT連携サービス

このモジュールは、OpenAI APIを利用してGPTとの連携機能を提供します。
ポートフォリオデータをGPT用に整形し、適切なプロンプトを構成して
投資アドバイスを取得する機能を実装しています。
"""
import os
import json
import logging
from typing import Dict, List, Optional, Any
from openai import OpenAI
from datetime import datetime

# ロガーの設定
logger = logging.getLogger(__name__)

class GPTService:
    """OpenAI APIを利用したGPTサービスクラス"""
    
    # デフォルトモデル
    DEFAULT_MODEL = "gpt-4"
    
    # システムプロンプトのテンプレート
    SYSTEM_PROMPT_TEMPLATE = """
    あなたは投資アドバイザーです。日本の個人投資家向けにポートフォリオの分析と改善提案を行います。
    以下のルールに従ってください：
    
    1. 具体的な数値分析に基づいた提案をしてください
    2. 理論的根拠と実践的なアドバイスをバランスよく提供してください
    3. ポートフォリオの強みと弱みを明確に示してください
    4. リスク分散、セクター配分、銘柄選定について具体的な提案をしてください
    5. 専門用語は必要に応じて使用しますが、わかりやすい言葉で説明してください
    6. 投資判断の最終決定はユーザー自身が行うことを前提としてください
    
    回答のフォーマット：
    - 「ポートフォリオ分析」セクション：現状の評価と特徴を述べる
    - 「改善提案」セクション：具体的なアクション項目を提示する
    - 「注意点」セクション：提案に関する留意事項を述べる
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初期化
        
        Args:
            api_key: OpenAI APIキー（Noneの場合は環境変数から取得）
        """
        # APIキーの設定
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI APIキーが設定されていません。環境変数OPENAI_API_KEYを設定してください。")
        
        # OpenAIクライアントの初期化
        self.client = OpenAI(api_key=self.api_key)
        
        # デフォルトパラメータ
        self.model = self.DEFAULT_MODEL
        self.system_prompt = self.SYSTEM_PROMPT_TEMPLATE.strip()
    
    def format_portfolio_data(self, portfolio_data: Dict) -> str:
        """
        ポートフォリオデータをGPT用に整形
        
        Args:
            portfolio_data: ポートフォリオデータ（PortfolioDataモデル準拠）
            
        Returns:
            整形されたポートフォリオデータのテキスト表現
        """
        try:
            items = portfolio_data.get('items', [])
            summary = portfolio_data.get('summary', {})
            
            # 基本情報の整形
            formatted_text = "# ポートフォリオ基本情報\n\n"
            formatted_text += f"- 総評価額: {summary.get('total_value', 0):,.0f}円\n"
            formatted_text += f"- 総取得価額: {summary.get('total_cost', 0):,.0f}円\n"
            formatted_text += f"- 総損益: {summary.get('total_profit_loss', 0):,.0f}円\n"
            formatted_text += f"- 総損益率: {summary.get('total_profit_loss_rate', 0):.2f}%\n"
            formatted_text += f"- 銘柄数: {summary.get('number_of_stocks', 0)}銘柄\n"
            formatted_text += f"- 利益銘柄数: {summary.get('profitable_stocks', 0)}銘柄\n"
            formatted_text += f"- 損失銘柄数: {summary.get('unprofitable_stocks', 0)}銘柄\n\n"
            
            # セクター配分の整形
            if 'sector_allocation' in summary and summary['sector_allocation']:
                formatted_text += "# セクター別配分\n\n"
                sector_allocation = summary['sector_allocation']
                total_value = summary.get('total_value', 0)
                
                for sector, value in sector_allocation.items():
                    percentage = (value / total_value * 100) if total_value > 0 else 0
                    formatted_text += f"- {sector}: {value:,.0f}円 ({percentage:.2f}%)\n"
                
                formatted_text += "\n"
            
            # 保有銘柄リストの整形
            formatted_text += "# 保有銘柄リスト\n\n"
            formatted_text += "| 銘柄コード | 銘柄名 | セクター | 保有数量 | 取得単価 | 現在価格 | 評価額 | 損益 | 損益率 |\n"
            formatted_text += "|-----------|--------|----------|----------|----------|----------|--------|------|--------|\n"
            
            for item in items:
                code = item.get('code', '')
                name = item.get('name', '')
                sector = item.get('sector', 'N/A')
                quantity = item.get('quantity', 0)
                cost_price = item.get('cost_price', 0)
                current_price = item.get('current_price', 0)
                value = item.get('value', 0)
                profit_loss = item.get('profit_loss', 0)
                profit_loss_rate = item.get('profit_loss_rate', 0)
                
                formatted_text += f"| {code} | {name} | {sector} | {quantity:,.0f} | {cost_price:,.0f} | {current_price:,.0f} | {value:,.0f} | {profit_loss:,.0f} | {profit_loss_rate:.2f}% |\n"
            
            return formatted_text
            
        except Exception as e:
            logger.error(f"ポートフォリオデータの整形エラー: {str(e)}")
            raise ValueError(f"ポートフォリオデータの整形に失敗しました: {str(e)}")
    
    def get_advice(self, portfolio_data: Dict, custom_prompt: Optional[str] = None) -> Dict:
        """
        ポートフォリオデータに基づいてGPTからアドバイスを取得
        
        Args:
            portfolio_data: ポートフォリオデータ
            custom_prompt: カスタムユーザープロンプト（オプション）
            
        Returns:
            GPTからのアドバイスを含む辞書
        """
        try:
            # ポートフォリオデータを整形
            formatted_data = self.format_portfolio_data(portfolio_data)
            
            # ユーザープロンプトの構成
            user_prompt = f"""
            以下のポートフォリオデータを分析し、投資アドバイスを提供してください。
            
            {formatted_data}
            """
            
            # カスタムプロンプトがある場合は追加
            if custom_prompt:
                user_prompt += f"\n\n追加の質問・条件：\n{custom_prompt}"
            
            # GPTに送信するメッセージを構成
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # OpenAI APIを呼び出し
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0,
            )
            
            # レスポンスからアドバイステキストを抽出
            advice_text = response.choices[0].message.content.strip()
            
            # タイムスタンプを取得
            timestamp = datetime.now().isoformat()
            
            # 結果を辞書形式で返す
            result = {
                "advice": advice_text,
                "model": self.model,
                "timestamp": timestamp,
                "success": True
            }
            
            return result
            
        except Exception as e:
            logger.error(f"GPTアドバイス取得エラー: {str(e)}")
            
            # エラー情報を辞書形式で返す
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def set_model(self, model_name: str) -> None:
        """
        使用するGPTモデルを設定
        
        Args:
            model_name: モデル名（例: "gpt-4", "gpt-3.5-turbo"など）
        """
        self.model = model_name
    
    def set_system_prompt(self, prompt: str) -> None:
        """
        システムプロンプトを設定
        
        Args:
            prompt: 新しいシステムプロンプト
        """
        self.system_prompt = prompt
