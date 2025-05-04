/**
 * API通信サービス
 * バックエンドAPIとの通信を管理する関数を提供
 */
import axios from 'axios';

// APIのベースURL（開発環境ではプロキシを使用）
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:8000/api';

// Axiosのインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * CSVファイルをアップロードして解析する
 * @param {File} file - アップロードするCSVファイル
 * @returns {Promise<Object>} 解析結果
 */
export const uploadCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    // エラーハンドリング
    if (error.response) {
      // サーバーからのエラーレスポンス
      return {
        success: false,
        message: error.response.data.message || 'サーバーエラーが発生しました。',
        error: error.response.data.error || error.message
      };
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      return {
        success: false,
        message: 'サーバーからの応答がありません。ネットワーク接続を確認してください。',
        error: 'NO_RESPONSE'
      };
    } else {
      // リクエスト設定中のエラー
      return {
        success: false,
        message: 'リクエストの送信に失敗しました。',
        error: error.message
      };
    }
  }
};

/**
 * サンプルポートフォリオデータを取得する
 * @returns {Promise<Object>} サンプルポートフォリオデータ
 */
export const getSamplePortfolio = async () => {
  try {
    const response = await apiClient.get('/csv/sample');
    return response.data;
  } catch (error) {
    // エラーハンドリング
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'サンプルデータの取得に失敗しました。',
        error: error.response.data.error || error.message
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'サーバーからの応答がありません。ネットワーク接続を確認してください。',
        error: 'NO_RESPONSE'
      };
    } else {
      return {
        success: false,
        message: 'リクエストの送信に失敗しました。',
        error: error.message
      };
    }
  }
};

/**
 * ポートフォリオの分析結果を取得する
 * @param {Object} portfolioData - 分析対象のポートフォリオデータ
 * @returns {Promise<Object>} 分析結果
 */
export const analyzePortfolio = async (portfolioData) => {
  try {
    const response = await apiClient.post('/portfolio/analyze', portfolioData);
    return response.data;
  } catch (error) {
    // エラーハンドリング
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'ポートフォリオの分析に失敗しました。',
        error: error.response.data.error || error.message
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'サーバーからの応答がありません。ネットワーク接続を確認してください。',
        error: 'NO_RESPONSE'
      };
    } else {
      return {
        success: false,
        message: 'リクエストの送信に失敗しました。',
        error: error.message
      };
    }
  }
};

// エクスポートするAPIクライアント（将来の拡張用）
export default apiClient;
