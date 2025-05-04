# エラーレポート

## 基本情報

- **日時**: 2025-05-04 15:23:45
- **コンポーネント**: CSVParser
- **エラータイプ**: ValueError
- **重要度**: Medium

## エラー詳細

### エラーメッセージ

```
ValueError: could not convert string to float: '1,500'
  File "/app/services/csv_parser.py", line 45, in parse_csv
    df[numeric_columns] = df[numeric_columns].astype(float)
  File "/usr/local/lib/python3.9/site-packages/pandas/core/generic.py", line 5912, in astype
    new_data = self._mgr.astype(dtype=dtype, copy=copy, errors=errors)
  File "/usr/local/lib/python3.9/site-packages/pandas/core/internals/managers.py", line 419, in astype
    return self.apply("astype", dtype=dtype, copy=copy, errors=errors)
```

### 発生状況

CSVファイル内の数値データにカンマ区切りの数値（例: "1,500"）が含まれており、これを浮動小数点数に変換しようとした際にエラーが発生しました。特に、「取得単価」と「評価額」のカラムでこの問題が発生しています。

## 原因分析

CSVパーサーが日本語表記の数値フォーマット（桁区切りにカンマを使用）を適切に処理できていないことが原因です。現在のコードでは、数値カラムを直接`float`型に変換しようとしていますが、カンマが含まれる文字列は直接変換できません。

問題箇所:
```python
# 現在のコード
df[numeric_columns] = df[numeric_columns].astype(float)
```

## 解決策

数値変換の前に、文字列からカンマを削除する前処理ステップを追加します。

```python
# 修正コード
def clean_numeric_string(s):
    if isinstance(s, str):
        return s.replace(',', '')
    return s

for col in numeric_columns:
    df[col] = df[col].apply(clean_numeric_string).astype(float)
```

この修正により、カンマを含む数値文字列を適切に浮動小数点数に変換できるようになります。

## 結果

修正を適用した結果、カンマを含む数値データを正常に処理できるようになりました。テストケースとして複数の形式（カンマあり/なし、小数点あり/なし）の数値を含むCSVファイルで検証し、すべて正常に処理されることを確認しました。

また、将来的な対応として以下の改善も行いました：
1. CSV形式ガイドに、数値はカンマなしで記入するよう明記
2. 入力検証の強化（数値データの前処理を自動化）
3. エラーメッセージを日本語化し、ユーザーにわかりやすく表示

## 追加情報

- 担当者: エンジニアA
- 修正コミット: `a1b2c3d`
- 関連ドキュメント: [CSV形式ガイド](../../docs/csv_format_guide.md)
