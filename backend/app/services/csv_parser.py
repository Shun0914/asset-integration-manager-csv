"""
CSVパーサーサービス

このモジュールは、アップロードされたCSVファイルを解析し、
アプリケーションで使用可能なポートフォリオデータに変換する機能を提供します。
複数の証券会社のCSV形式に対応し、必要に応じてデータの補完も行います。
"""
import pandas as pd
import numpy as np
import io
from typing import Dict, List, Union, Optional, Tuple
import logging

# ロガーの設定
logger = logging.getLogger(__name__)

class CSVParserService:
    """CSVファイルをパースしてポートフォリオデータに変換するサービスクラス"""
    
    # 標準カラムのマッピング
    STANDARD_COLUMNS = {
        'code': '銘柄コード',
        'name': '銘柄名',
        'market': '市場区分',
        'sector': 'セクター',
        'quantity': '保有数量',
        'cost_price': '取得単価',
        'current_price': '現在価格',
        'value': '評価額',
        'profit_loss': '損益',
        'profit_loss_rate': '損益率',
        'currency': '通貨',
        'acquisition_date': '取得日',
        'dividend_yield': '配当利回り'
    }
    
    # 各証券会社のカラムマッピング
    BROKER_MAPPINGS = {
        'standard': {
            '銘柄コード': 'code',
            '銘柄名': 'name',
            '市場区分': 'market',
            'セクター': 'sector',
            '保有数量': 'quantity',
            '取得単価': 'cost_price',
            '現在価格': 'current_price',
            '評価額': 'value',
            '損益': 'profit_loss',
            '損益率': 'profit_loss_rate',
            '通貨': 'currency',
            '取得日': 'acquisition_date',
            '配当利回り': 'dividend_yield'
        },
        'matsui': {
            '銘柄コード': 'code',
            '銘柄名': 'name',
            '保有数': 'quantity',
            '取得単価': 'cost_price',
            '現在値': 'current_price',
            '損益': 'profit_loss',
            '評価額': 'value'
        },
        'matsui_us': {
            'ティッカー': 'code',
            '銘柄': 'name',
            '市場': 'market',
            '口座区分': 'account_type',
            '保有数[株]': 'quantity',
            '取得平均[ドル]': 'cost_price_usd',
            '取得平均[円]': 'cost_price',
            '参考取得平均[ドル]': 'reference_cost_price_usd',
            '評価単価[ドル]': 'current_price_usd',
            '評価単価[円]': 'current_price',
            '時価評価額[ドル]': 'value_usd',
            '時価評価額[円]': 'value',
            '評価損益額[ドル]': 'profit_loss_usd',
            '評価損益額[円]': 'profit_loss',
            '損益率[ドル]': 'profit_loss_rate_usd',
            '損益率[円]': 'profit_loss_rate',
        },
        'rakuten': {
            '銘柄コード': 'code',
            '銘柄名': 'name',
            '市場': 'market',
            '保有株数': 'quantity',
            '平均取得単価（円）': 'cost_price',
            '現在値（円）': 'current_price',
            '評価額（円）': 'value',
            '評価損益（円）': 'profit_loss',
            '評価損益率（％）': 'profit_loss_rate'
        },
        'sbi': {
            '銘柄コード': 'code',
            '銘柄': 'name',
            '数量': 'quantity',
            '平均取得単価': 'cost_price',
            '現在値': 'current_price',
            '評価額': 'value',
            '損益': 'profit_loss',
            '損益率': 'profit_loss_rate'
        }
    }
    
    # 必須カラム（内部名）
    REQUIRED_COLUMNS = ['code', 'name', 'quantity', 'cost_price', 'current_price']
    
    # 数値カラム（内部名）
    NUMERIC_COLUMNS = [
        'quantity', 'cost_price', 'current_price', 
        'value', 'profit_loss', 'profit_loss_rate', 'dividend_yield',
        # 米国株式用の追加カラム
        'cost_price_usd', 'reference_cost_price_usd', 'current_price_usd',
        'value_usd', 'profit_loss_usd', 'profit_loss_rate_usd'
    ]
    
    def __init__(self):
        """初期化"""
        pass
    
    def parse_csv_file(self, file_content: bytes, encoding: str = 'utf-8') -> Dict:
        """
        CSVファイルを解析してポートフォリオデータに変換
        
        Args:
            file_content: CSVファイルのバイトコンテンツ
            encoding: ファイルのエンコーディング（デフォルトはUTF-8）
            
        Returns:
            解析結果のポートフォリオデータを含む辞書
        """
        try:
            # バイトストリームからデータフレームを作成
            try:
                df = pd.read_csv(io.BytesIO(file_content), encoding=encoding)
            except UnicodeDecodeError:
                # UTF-8で失敗した場合はShift-JISでトライ
                try:
                    df = pd.read_csv(io.BytesIO(file_content), encoding='shift-jis')
                except UnicodeDecodeError:
                    # Shift-JISでも失敗した場合はiso-8859-1でトライ（松井証券米国株式CSVの場合）
                    df = pd.read_csv(io.BytesIO(file_content), encoding='iso-8859-1')
                
            # CSVフォーマットを検出
            broker_type, mapping = self._detect_csv_format(df)
            
            # カラムをマッピング
            df_mapped = self._map_columns(df, mapping)
            
            # 必須カラムの確認
            self._validate_required_columns(df_mapped)
            
            # データ型の変換と前処理
            df_processed = self._preprocess_data(df_mapped)
            
            # 欠損データの補完
            df_completed = self._complete_missing_data(df_processed)
            
            # ポートフォリオ情報を計算
            portfolio_summary = self._calculate_portfolio_summary(df_completed)
            
            return {
                'broker_type': broker_type,
                'items': df_completed.to_dict(orient='records'),
                'summary': portfolio_summary
            }
            
        except Exception as e:
            logger.error(f"CSV解析エラー: {str(e)}")
            raise ValueError(f"CSVファイルの解析に失敗しました: {str(e)}")
            
    def _detect_csv_format(self, df: pd.DataFrame) -> Tuple[str, Dict]:
        """
        CSVファイルのフォーマット（証券会社）を検出
        
        Args:
            df: 解析対象のデータフレーム
            
        Returns:
            (検出された証券会社タイプ, カラムマッピング辞書)
        """
        # カラム名のリスト
        columns = df.columns.tolist()
        
        # 各証券会社のマッピングとのマッチングスコアを計算
        scores = {}
        for broker, mapping in self.BROKER_MAPPINGS.items():
            # マッピングのキー（証券会社CSVのカラム名）がどれだけ含まれているか
            matched_columns = [col for col in columns if col in mapping]
            scores[broker] = len(matched_columns) / len(mapping)
        
        # 最もスコアが高い証券会社を選択
        best_match = max(scores.items(), key=lambda x: x[1])
        
        # 十分なマッチングがなければ標準フォーマットと見なす
        if best_match[1] < 0.5:
            return 'standard', self.BROKER_MAPPINGS['standard']
            
        return best_match[0], self.BROKER_MAPPINGS[best_match[0]]
    
    def _map_columns(self, df: pd.DataFrame, mapping: Dict) -> pd.DataFrame:
        """
        データフレームのカラムを標準形式にマッピング
        
        Args:
            df: 元のデータフレーム
            mapping: カラムマッピング辞書
            
        Returns:
            マッピング後のデータフレーム
        """
        # 新しい空のデータフレームを作成
        df_mapped = pd.DataFrame()
        
        # 各カラムをマッピングしながらコピー
        for original_col, mapped_col in mapping.items():
            if original_col in df.columns:
                df_mapped[mapped_col] = df[original_col]
                
        return df_mapped
    
    def _validate_required_columns(self, df: pd.DataFrame) -> None:
        """
        必須カラムが存在するか検証
        
        Args:
            df: 検証対象のデータフレーム
            
        Raises:
            ValueError: 必須カラムが不足している場合
        """
        missing_columns = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            missing_names = [self.STANDARD_COLUMNS[col] for col in missing_columns]
            raise ValueError(f"必須カラムが不足しています: {', '.join(missing_names)}")
    
    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        データの前処理（データ型変換、カンマ除去など）
        
        Args:
            df: 処理対象のデータフレーム
            
        Returns:
            前処理後のデータフレーム
        """
        # データフレームのコピーを作成
        processed_df = df.copy()
        
        # 数値カラムの処理
        for col in self.NUMERIC_COLUMNS:
            if col in processed_df.columns:
                # 文字列型のカラムからカンマを削除
                if processed_df[col].dtype == 'object':
                    processed_df[col] = processed_df[col].astype(str).str.replace(',', '')
                
                # 数値に変換
                processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
        
        # 日付カラムの処理
        if 'acquisition_date' in processed_df.columns:
            processed_df['acquisition_date'] = pd.to_datetime(
                processed_df['acquisition_date'], 
                errors='coerce', 
                format='%Y-%m-%d'
            )
        
        # 'code'カラムを文字列型に変換
        # - Pydanticモデルが文字列型を期待しているため、明示的に変換する
        # - CSVで数字だけの場合、Pandasが自動的に整数型に変換してしまうための対応
        if 'code' in processed_df.columns:
            processed_df['code'] = processed_df['code'].astype(str)
        
        return processed_df
    
    def _complete_missing_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        欠損データを計算して補完
        
        Args:
            df: 補完対象のデータフレーム
            
        Returns:
            補完後のデータフレーム
        """
        # データフレームのコピーを作成
        completed_df = df.copy()
        
        # 米国株式データかどうかを判定
        is_us_stock = 'cost_price_usd' in completed_df.columns
        
        # 評価額の計算 (保有数量 × 現在価格)
        if 'quantity' in completed_df.columns and 'current_price' in completed_df.columns:
            if 'value' not in completed_df.columns or completed_df['value'].isna().any():
                completed_df['value'] = completed_df['quantity'] * completed_df['current_price']
        
        # 米国株式の場合はドル建て評価額も計算
        if is_us_stock and 'quantity' in completed_df.columns and 'current_price_usd' in completed_df.columns:
            if 'value_usd' not in completed_df.columns or completed_df['value_usd'].isna().any():
                completed_df['value_usd'] = completed_df['quantity'] * completed_df['current_price_usd']
        
        # 取得価額の計算
        if 'quantity' in completed_df.columns and 'cost_price' in completed_df.columns:
            completed_df['cost_total'] = completed_df['quantity'] * completed_df['cost_price']
        
        # 米国株式の場合はドル建て取得総額も計算
        if is_us_stock and 'quantity' in completed_df.columns and 'cost_price_usd' in completed_df.columns:
            completed_df['cost_total_usd'] = completed_df['quantity'] * completed_df['cost_price_usd']
        
        # 損益の計算 (評価額 - 取得価額)
        if 'value' in completed_df.columns and 'cost_total' in completed_df.columns:
            if 'profit_loss' not in completed_df.columns or completed_df['profit_loss'].isna().any():
                completed_df['profit_loss'] = completed_df['value'] - completed_df['cost_total']
        
        # 米国株式の場合はドル建て損益も計算
        if is_us_stock and 'value_usd' in completed_df.columns and 'cost_total_usd' in completed_df.columns:
            if 'profit_loss_usd' not in completed_df.columns or completed_df['profit_loss_usd'].isna().any():
                completed_df['profit_loss_usd'] = completed_df['value_usd'] - completed_df['cost_total_usd']
        
        # 損益率の計算 (損益 ÷ 取得価額 × 100)
        if 'profit_loss' in completed_df.columns and 'cost_total' in completed_df.columns:
            if 'profit_loss_rate' not in completed_df.columns or completed_df['profit_loss_rate'].isna().any():
                # ゼロ除算を防ぐ
                completed_df['profit_loss_rate'] = np.where(
                    completed_df['cost_total'] != 0,
                    completed_df['profit_loss'] / completed_df['cost_total'] * 100,
                    0
                )
        
        # 米国株式の場合はドル建て損益率も計算
        if is_us_stock and 'profit_loss_usd' in completed_df.columns and 'cost_total_usd' in completed_df.columns:
            if 'profit_loss_rate_usd' not in completed_df.columns or completed_df['profit_loss_rate_usd'].isna().any():
                # ゼロ除算を防ぐ
                completed_df['profit_loss_rate_usd'] = np.where(
                    completed_df['cost_total_usd'] != 0,
                    completed_df['profit_loss_usd'] / completed_df['cost_total_usd'] * 100,
                    0
                )
        
        # 通貨の設定（米国株式の場合はUSD、それ以外はJPY）
        if 'currency' not in completed_df.columns:
            completed_df['currency'] = 'USD' if is_us_stock else 'JPY'
        else:
            default_currency = 'USD' if is_us_stock else 'JPY'
            completed_df['currency'].fillna(default_currency, inplace=True)
            
        # 補助カラムを削除
        columns_to_drop = []
        if 'cost_total' in completed_df.columns:
            columns_to_drop.append('cost_total')
        if 'cost_total_usd' in completed_df.columns:
            columns_to_drop.append('cost_total_usd')
            
        if columns_to_drop:
            completed_df.drop(columns=columns_to_drop, axis=1, inplace=True)
            
        return completed_df
    
    def _calculate_portfolio_summary(self, df: pd.DataFrame) -> Dict:
        """
        ポートフォリオ全体のサマリー情報を計算
        
        Args:
            df: 計算対象のデータフレーム
            
        Returns:
            サマリー情報を含む辞書
        """
        summary = {}
        
        # 米国株式データかどうかを判定
        is_us_stock = 'cost_price_usd' in df.columns
        
        # 総評価額
        if 'value' in df.columns:
            summary['total_value'] = df['value'].sum()
            summary['total_value_currency'] = 'JPY'
        
        # 米国株式の場合はドル建て総評価額も計算
        if is_us_stock and 'value_usd' in df.columns:
            summary['total_value_usd'] = df['value_usd'].sum()
            summary['total_value_usd_currency'] = 'USD'
        
        # 総損益
        if 'profit_loss' in df.columns:
            summary['total_profit_loss'] = df['profit_loss'].sum()
            summary['total_profit_loss_currency'] = 'JPY'
        
        # 米国株式の場合はドル建て総損益も計算
        if is_us_stock and 'profit_loss_usd' in df.columns:
            summary['total_profit_loss_usd'] = df['profit_loss_usd'].sum()
            summary['total_profit_loss_usd_currency'] = 'USD'
        
        # 総取得価額
        if 'quantity' in df.columns and 'cost_price' in df.columns:
            total_cost = (df['quantity'] * df['cost_price']).sum()
            summary['total_cost'] = total_cost
            summary['total_cost_currency'] = 'JPY'
        
        # 米国株式の場合はドル建て総取得価額も計算
        if is_us_stock and 'quantity' in df.columns and 'cost_price_usd' in df.columns:
            total_cost_usd = (df['quantity'] * df['cost_price_usd']).sum()
            summary['total_cost_usd'] = total_cost_usd
            summary['total_cost_usd_currency'] = 'USD'
        
        # 総損益率
        if 'total_profit_loss' in summary and 'total_cost' in summary and summary['total_cost'] != 0:
            summary['total_profit_loss_rate'] = (summary['total_profit_loss'] / summary['total_cost']) * 100
        else:
            summary['total_profit_loss_rate'] = 0
        
        # 米国株式の場合はドル建て総損益率も計算
        if is_us_stock and 'total_profit_loss_usd' in summary and 'total_cost_usd' in summary and summary['total_cost_usd'] != 0:
            summary['total_profit_loss_rate_usd'] = (summary['total_profit_loss_usd'] / summary['total_cost_usd']) * 100
        elif is_us_stock:
            summary['total_profit_loss_rate_usd'] = 0
        
        # 銘柄数
        summary['number_of_stocks'] = len(df)
        
        # セクター別構成
        if 'sector' in df.columns and 'value' in df.columns:
            sector_allocation = df.groupby('sector')['value'].sum()
            summary['sector_allocation'] = sector_allocation.to_dict()
        
        # 米国株式の場合は市場別構成も計算
        if is_us_stock and 'market' in df.columns and 'value' in df.columns:
            market_allocation = df.groupby('market')['value'].sum()
            summary['market_allocation'] = market_allocation.to_dict()
        
        # 損益別銘柄数
        if 'profit_loss' in df.columns:
            summary['profitable_stocks'] = int((df['profit_loss'] > 0).sum())
            summary['unprofitable_stocks'] = int((df['profit_loss'] < 0).sum())
            summary['breakeven_stocks'] = int((df['profit_loss'] == 0).sum())
        
        return summary