| ERROR_20250504001 | PydanticImportError | 2025-05-04 | Pydanticバージョン互換性エラー | `/logs/error_logs/error_report_20250504001.md` | Pydantic 2.xでの`BaseSettings`移動に関するインポートエラー、pydantic-settingsパッケージの導入による解決 |
| ERROR_20250504002 | ConfigValidationError | 2025-05-04 | Pydantic設定検証エラー | `/logs/error_logs/error_report_20250504002.md` | Pydantic 2.xでのConfigクラスからmodel_configへの変更対応、設定方法の更新 |
| ERROR_20250504003 | SyntaxError | 2025-05-04 | Reactコンポーネント構造エラー | `/logs/error_logs/error_report_20250504003.md` | App.jsxの不完全な構造によるコンパイルエラー、コンポーネント定義の修正 |
| ERROR_20250504004 | ReactHooksError | 2025-05-04 | React Hooksルール違反 | `/logs/error_logs/error_report_20250504004.md` | 条件付きでのuseEffect/useMemo呼び出しによるエラー、Reactフックルールに準拠するよう修正 |
| ERROR_20250504005 | ExportError | 2025-05-04 | コンポーネントエクスポートエラー | `/logs/error_logs/error_report_20250504005.md` | PortfolioTableコンポーネントのエクスポート文欠落、デフォルトエクスポートの追加 |
| ERROR_20250504006 | TypeConversionError | 2025-05-04 | CSV銘柄コード型変換エラー | `/logs/error_logs/error_report_20250504006.md` | CSVから読み込んだ銘柄コードが数値型として解析される問題、明示的な文字列型変換の追加 |
| ERROR_20250504007 | IndentationError | 2025-05-04 | CSVパーサーインデントエラー | `/logs/error_logs/error_report_20250504007.md` | 部分的なコード更新によるファイル構造破損、インデントエラーの修正と構造再構築 |
| ERROR_20250504008 | EncodingError | 2025-05-04 | 米国株式CSVエンコーディングエラー | `/logs/error_logs/error_report_20250504008.md` | 松井証券米国株式CSVのISO-8859-1エンコーディング非対応問題、対応コードの追加 |
| ERROR_20250504009 | IndentationError | 2025-05-04 | CSVパーサー再構築後のインデントエラー | `/logs/error_logs/error_report_20250504009.md` | 米国株式CSV対応追加後の構造破損、サーバー起動失敗と全体構造の再修正 |
| ERROR_20250504010 | ValidationError | 2025-05-04 | 米国株式ティッカーバリデーションエラー | `/logs/error_logs/error_report_20250504010.md` | 米国株ティッカーシンボルが証券コードバリデーションに失敗、バリデーションルールの拡張 |
| ERROR_20250504011 | ValidationError | 2025-05-04 | 米国市場区分バリデーションエラー | `/logs/error_logs/error_report_20250504011.md` | NYSE等の米国市場区分がModelEnumに未定義、市場区分定義の拡張と追加 |
| ERROR_20250504012 | ValidationError | 2025-05-04 | Arca市場バリデーションエラー | `/logs/error_logs/error_report_20250504012.md` | Arca市場区分が認識されずバリデーションエラー、MarketEnum定義に追加 |
| ERROR_20250504013 | NameError | 2025-05-04 | Enumインポート欠落エラー | `/logs/error_logs/error_report_20250504013.md` | portfolio.pyでの`from enum import Enum`インポート文欠落、インポート追加による修正 |
| ERROR_20250505001 | NameError | 2025-05-05 | BaseModelインポート欠落エラー | `/logs/error_logs/error_report_20250505001.md` | portfolio.pyファイルの破損による`BaseModel`インポート欠落、ファイル全体の再構築による修正 |
| ERROR_20250505002 | JSONParseError | 2025-05-05 | package.jsonパース失敗 | `/logs/error_logs/error_report_20250505002.md` | 部分的な更新によるpackage.jsonファイルの破損、完全なJSONファイルとして再構築 |
| ERROR_20250505003 | RequestError | 2025-05-05 | 404 Not Found エラー | `/logs/error_logs/error_report_20250505003.md` | GPTアドバイスAPIエンドポイントが見つからないエラー、FastAPIルーターに明示的なプレフィックス(/api)を追加して解決 |
| ERROR_20250505004 | NameError | 2025-05-05 | app変数未定義エラー | `/logs/error_logs/error_report_20250505004.md` | main.pyファイルの破損によるapp変数の未定義エラー、FastAPIアプリケーションファイルの完全な再構築による修正 |
| ERROR_20250505005 | RoutingError | 2025-05-05 | ルータープレフィックス重複エラー | `/logs/error_logs/error_report_20250505005.md` | CSVルーターのプレフィックス(/api/csv)とmain.pyのプレフィックス(/api)の重複によるエンドポイント不一致、CSVルーターのプレフィックスを/csvに修正 |
| ERROR_20250505006 | NameError | 2025-05-05 | APIRouterインポート欠落エラー | `/logs/error_logs/error_report_20250505006.md` | csv.pyファイルの部分的更新によるAPIRouterインポート文の欠落、ファイル全体の再構築による修正 |
| ERROR_20250505007 | NameError | 2025-05-05 | loggingインポート欠落エラー | `/logs/error_logs/error_report_20250505007.md` | csv.pyファイルの不完全な再構築によるloggingモジュールインポート文の欠落、すべての必要なインポートを追加して修正 |
| ERROR_20250505008 | ImportError | 2025-05-05 | routerエクスポート欠落エラー | `/logs/error_logs/error_report_20250505008.md` | csv.pyファイルからrouterオブジェクトをインポートできないエラー、ファイル全体を完全に再構築して解決 |