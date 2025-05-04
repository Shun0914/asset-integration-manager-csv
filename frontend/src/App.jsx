/**
 * Asset Integration Manager - メインアプリケーションコンポーネント
 * アプリケーション全体のレイアウトとルーティングを管理します
 */
import React, { useState } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { PortfolioContext } from './context/PortfolioContext';

// コンポーネントのインポート
import FileUpload from './components/FileUpload/FileUpload';
import PortfolioTable from './components/Portfolio/PortfolioTable';
import PortfolioSummary from './components/Portfolio/PortfolioSummary';
import SectorPieChart from './components/Charts/SectorPieChart';
import ProfitLossChart from './components/Charts/ProfitLossChart';

function App() {
  // ポートフォリオデータの状態
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <PortfolioContext.Provider value={{ portfolioData, setPortfolioData, isLoading, setIsLoading, error, setError }}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Asset Integration Manager
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            CSVポートフォリオ分析ツール
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              CSVファイルをアップロード
            </Typography>
            <FileUpload />
          </Paper>

          {portfolioData && (
            <>
              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ポートフォリオ概要
                </Typography>
                <PortfolioSummary />
              </Paper>

              <Box sx={{ display: 'flex', mt: 3, gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                  <SectorPieChart />
                </Box>
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                  <ProfitLossChart />
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  保有銘柄一覧
                </Typography>
                <PortfolioTable />
              </Box>
            </>
          )}
        </Box>
      </Container>
    </PortfolioContext.Provider>
  );
}

export default App;