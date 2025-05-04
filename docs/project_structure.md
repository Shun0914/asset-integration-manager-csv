# Asset Integration Manager プロジェクト構造設計書

## ディレクトリ構造

```
asset_integration_manager/
├── frontend/                    # Reactフロントエンド
│   ├── public/                  # 静的ファイル
│   │   ├── index.html          # エントリーポイントHTML
│   │   ├── favicon.ico         # ファビコン
│   │   └── assets/             # 画像等の静的アセット
│   └── src/                     # ソースコード
│       ├── components/          # UIコンポーネント
│       │   ├── FileUpload/      # CSVアップロード関連
│       │   │   ├── FileUpload.jsx       # ドラッグ&ドロップUI
│       │   │   └── FileParser.jsx       # CSV解析コンポーネント
│       │   ├── Portfolio/       # ポートフォリオ表示関連
│       │   │   ├── PortfolioTable.jsx   # 銘柄一覧テーブル
│       │   │   ├── PortfolioSummary.jsx # サマリー表示
│       │   │   └── PortfolioDetail.jsx  # 詳細表示
│       │   ├── Charts/          # グラフ表示関連
│       │   │   ├── SectorPieChart.jsx   # セクター配分円グラフ
│       │   │   ├── ProfitLossChart.jsx  # 損益棒グラフ
│       │   │   └── AllocationChart.jsx  # 資産配分図
│       │   └── GPT/             # GPTアドバイス関連
│       │       ├── AdvicePanel.jsx      # アドバイス表示
│       │       └── AdviceForm.jsx       # 質問入力フォーム
│       ├── services/            # APIリクエスト処理
│       │   ├── api.js           # APIクライアント
│       │   └── portfolio.js     # ポートフォリオ関連API
│       ├── utils/               # ユーティリティ関数
│       │   ├── csvHelpers.js    # CSV処理ヘルパー
│       │   ├── dataFormatters.js # データフォーマット
│       │   └── calculations.js  # 計算ロジック
│       ├── context/             # Reactコンテキスト
│       │   └── PortfolioContext.jsx # ポートフォリオ状態管理
│       ├── App.jsx              # アプリルートコンポーネント
│       ├── index.jsx            # Reactエントリーポイント
│       └── theme.js             # MUIテーマ設定
│
├── backend/                     # FastAPIバックエンド
│   ├── app/                     # アプリケーションコード
│   │   ├── api/                 # APIエンドポイント
│   │   │   ├── __init__.py     # パッケージ初期化
│   │   │   ├── routes.py       # ルート定義
│   │   │   ├── csv.py          # CSV処理API
│   │   │   ├── portfolio.py    # ポートフォリオAPI
│   │   │   └── gpt.py          # GPTアドバイスAPI
│   │   ├── core/                # 設定・ユーティリティ
│   │   │   ├── __init__.py     # パッケージ初期化
│   │   │   ├── config.py       # 設定
│   │   │   └── security.py     # セキュリティ設定
│   │   ├── models/              # データモデル
│   │   │   ├── __init__.py     # パッケージ初期化
│   │   │   ├── portfolio.py    # ポートフォリオモデル
│   │   │   └── response.py     # レスポンスモデル
│   │   ├── services/            # ビジネスロジック
│   │   │   ├── __init__.py     # パッケージ初期化
│   │   │   ├── csv_parser.py   # CSV解析サービス
│   │   │   ├── portfolio_analyzer.py # ポートフォリオ分析
│   │   │   └── gpt_service.py  # GPT連携サービス
│   │   ├── utils/               # ユーティリティ関数
│   │   │   ├── __init__.py     # パッケージ初期化
│   │   │   └── helpers.py      # ヘルパー関数
│   │   └── main.py             # FastAPIアプリケーション
│   ├── tests/                   # テストコード
│   │   ├── __init__.py         # パッケージ初期化
│   │   ├── test_csv.py         # CSV処理テスト
│   │   ├── test_portfolio.py   # ポートフォリオ処理テスト
│   │   └── test_gpt.py         # GPT連携テスト
│   ├── requirements.txt         # 依存パッケージリスト
│   └── Dockerfile              # バックエンド用Dockerfile
│
├── docs/                        # ドキュメント
│   ├── project_overview.md     # プロジェクト概要
│   ├── requirements_specification.md # 要件定義書
│   ├── project_structure.md    # プロジェクト構造設計書
│   ├── api_documentation.md    # API仕様書
│   ├── development_guide.md    # 開発ガイド
│   ├── csv_format_guide.md     # CSV形式ガイド
│   └── deployment_guide.md     # デプロイガイド
│
├── logs/                        # ログファイル
│   ├── error_logs/             # エラーログ
│   └── audit_logs/             # 監査ログ
│
├── samples/                     # サンプルデータ
│   ├── sample_portfolio.csv    # サンプルポートフォリオCSV
│   └── sample_results.json     # サンプル分析結果
│
├── docker-compose.yml          # 開発用Docker Compose
├── .gitignore                  # Git除外設定
└── README.md                   # プロジェクト説明
```

## コンポーネント間の関係

### データフロー

1. **ユーザー → フロントエンド**
   - CSVファイルのアップロード
   - 分析リクエスト
   - GPTアドバイスリクエスト

2. **フロントエンド → バックエンド**
   - CSVデータの送信
   - 分析パラメータの送信
   - GPTプロンプトの送信

3. **バックエンド内部処理**
   - CSV解析 → ポートフォリオモデル変換
   - ポートフォリオ分析（セクター分析、リスク計算など）
   - GPTプロンプト生成とAPI呼び出し

4. **バックエンド → フロントエンド**
   - 解析済みポートフォリオデータ
   - 分析結果（サマリー、セクター配分など）
   - GPTアドバイス

5. **フロントエンド → ユーザー**
   - テーブル・グラフによる可視化
   - サマリー情報の表示
   - GPTアドバイスの表示

### 責任分担

#### フロントエンド

- ユーザー入力の検証と前処理
- UIレンダリングとインタラクション
- データの視覚化
- ローカル状態管理

#### バックエンド

- CSVファイルの検証と解析
- ポートフォリオデータの計算と分析
- GPTとの連携とプロンプト管理
- APIエンドポイントの提供

## 開発プロセス

1. **基本構造の構築**
   - プロジェクトスケルトン作成
   - 環境設定

2. **フロントエンド開発**
   - ファイルアップロードコンポーネント
   - テーブル・グラフ表示コンポーネント
   - データフォーマットとUIロジック

3. **バックエンド開発**
   - CSVパーサー実装
   - ポートフォリオ分析エンジン
   - APIエンドポイント設計

4. **統合テスト**
   - フロント-バック連携テスト
   - エンドツーエンドテスト

5. **GPT連携実装**
   - プロンプト設計
   - アドバイス生成ロジック

6. **最終調整**
   - パフォーマンス最適化
   - コードリファクタリング
   - ドキュメント整備
