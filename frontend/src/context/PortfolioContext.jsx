/**
 * ポートフォリオコンテキスト
 * アプリケーション全体でポートフォリオデータを共有するためのReactコンテキスト
 */
import { createContext } from 'react';

// デフォルト値を設定
export const PortfolioContext = createContext({
  portfolioData: null,
  setPortfolioData: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
});
