/**
 * ポートフォリオサマリーコンポーネント
 * ポートフォリオ全体の概要情報（総評価額、総損益など）を表示
 */
import React, { useContext } from 'react';
import { 
  Box, 
  Grid,
  Paper,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import { PortfolioContext } from '../../context/PortfolioContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BalanceIcon from '@mui/icons-material/Balance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PieChartIcon from '@mui/icons-material/PieChart';
import InventoryIcon from '@mui/icons-material/Inventory';

// 数値のフォーマット関数
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercent = (value) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

// サマリーカードコンポーネント
const SummaryCard = ({ title, value, icon, backgroundColor, textColor }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 2,
      height: '100%',
      backgroundColor,
      color: textColor || 'text.primary',
      borderRadius: 2,
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="subtitle2" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h5" component="div" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

const PortfolioSummary = () => {
  // コンテキストからポートフォリオデータを取得
  const { portfolioData } = useContext(PortfolioContext);
  
  // データが存在しない場合はレンダリングしない
  if (!portfolioData || !portfolioData.summary) {
    return null;
  }

  const { summary } = portfolioData;

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {/* 総評価額 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="総評価額"
            value={formatCurrency(summary.total_value)}
            icon={<MonetizationOnIcon />}
            backgroundColor="#f5f9ff"
          />
        </Grid>
        
        {/* 総損益 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="総損益"
            value={formatCurrency(summary.total_profit_loss)}
            icon={summary.total_profit_loss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            backgroundColor={summary.total_profit_loss >= 0 ? '#f0f9f0' : '#fff0f0'}
            textColor={summary.total_profit_loss >= 0 ? '#2E7D32' : '#D32F2F'}
          />
        </Grid>
        
        {/* 総損益率 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="総損益率"
            value={formatPercent(summary.total_profit_loss_rate)}
            icon={<BalanceIcon />}
            backgroundColor={summary.total_profit_loss_rate >= 0 ? '#f0f9f0' : '#fff0f0'}
            textColor={summary.total_profit_loss_rate >= 0 ? '#2E7D32' : '#D32F2F'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      
      <Grid container spacing={2}>
        {/* 保有銘柄数 */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="保有銘柄数"
            value={summary.number_of_stocks}
            icon={<InventoryIcon />}
            backgroundColor="#f5f5f5"
          />
        </Grid>
        
        {/* 損益別銘柄数 */}
        <Grid item xs={12} sm={6} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f8f9fa',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PieChartIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">損益別銘柄数</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <Chip 
                label={`利益: ${summary.profitable_stocks}銘柄`} 
                color="success" 
                variant="outlined" 
                size="medium"
              />
              <Chip 
                label={`損失: ${summary.unprofitable_stocks}銘柄`} 
                color="error" 
                variant="outlined" 
                size="medium"
              />
              <Chip 
                label={`トントン: ${summary.breakeven_stocks}銘柄`} 
                color="default" 
                variant="outlined" 
                size="medium"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PortfolioSummary;
