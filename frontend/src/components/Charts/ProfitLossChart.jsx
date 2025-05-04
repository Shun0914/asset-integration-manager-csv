/**
 * 損益状況棒グラフコンポーネント
 * ポートフォリオ内の各銘柄の損益を棒グラフで表示
 */
import React, { useContext, useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PortfolioContext } from '../../context/PortfolioContext';

// Chart.jsコンポーネントの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 通貨フォーマット関数
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
};

const ProfitLossChart = () => {
  const theme = useTheme();
  const { portfolioData } = useContext(PortfolioContext);

  // React Hooksのルールに従い、useMemoをコンポーネントのトップレベルで呼び出す
  // 条件付きロジックはuseMemoの中に移動
  const chartData = useMemo(() => {
    // データが存在しない場合はnullを返す
    if (!portfolioData || !portfolioData.items || portfolioData.items.length === 0) {
      return null;
    }
    
    // データを損益の降順にソート
    const sortedItems = [...portfolioData.items].sort((a, b) => b.profit_loss - a.profit_loss);
    
    // 上位7銘柄と下位3銘柄を抽出（計10銘柄）
    const topItems = sortedItems.slice(0, 7);
    const bottomItems = sortedItems.slice(-3);
    const selectedItems = [...topItems, ...bottomItems];
    
    // 銘柄が10個未満の場合は全て表示
    const itemsToShow = portfolioData.items.length <= 10 
      ? sortedItems 
      : selectedItems;
    
    // グラフ用のデータを作成
    const labels = itemsToShow.map(item => item.name);
    const profitLossData = itemsToShow.map(item => item.profit_loss);
    const colors = itemsToShow.map(item => 
      item.profit_loss >= 0 ? theme.palette.success.main : theme.palette.error.main
    );
    
    return {
      labels,
      datasets: [
        {
          label: '損益',
          data: profitLossData,
          backgroundColor: colors,
          borderColor: colors.map(color => color),
          borderWidth: 1
        }
      ],
      items: itemsToShow
    };
  }, [portfolioData, theme.palette.success.main, theme.palette.error.main]);

  // データが存在しない場合はここでチェック
  if (!chartData) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          textAlign: 'center', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          損益データがありません
        </Typography>
      </Paper>
    );
  }

  // グラフのオプション設定
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const item = chartData.items[context.dataIndex];
            const profitLoss = formatCurrency(item.profit_loss);
            const profitLossRate = `${item.profit_loss_rate.toFixed(2)}%`;
            return [
              `損益: ${profitLoss}`,
              `損益率: ${profitLossRate}`,
              `評価額: ${formatCurrency(item.value)}`,
              `保有数量: ${item.quantity}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: theme.palette.divider
        },
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: 'medium', mb: 2 }}
      >
        銘柄別損益状況
      </Typography>
      
      <Box sx={{ flexGrow: 1, height: '300px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </Box>
      
      {portfolioData.items.length > 10 && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          ※ 損益上位7銘柄と下位3銘柄を表示しています
        </Typography>
      )}
    </Paper>
  );
};

export default ProfitLossChart;