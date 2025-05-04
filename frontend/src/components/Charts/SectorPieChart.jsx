/**
 * セクター配分円グラフコンポーネント
 * ポートフォリオのセクター別構成比を円グラフで表示
 */
import React, { useContext, useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PortfolioContext } from '../../context/PortfolioContext';

// Chart.jsコンポーネントの登録
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// セクターごとの色を定義
const sectorColors = {
  '自動車・輸送機': '#4285F4', // 青
  '情報・通信': '#EA4335',     // 赤
  '銀行・金融': '#FBBC05',     // 黄
  '電気機器': '#34A853',       // 緑
  'サービス': '#8E24AA',       // 紫
  '食品': '#F4511E',           // オレンジ
  '医薬品': '#00ACC1',         // 水色
  '小売': '#AB47BC',           // ピンク紫
  '建設・不動産': '#6D4C41',   // 茶
  'エネルギー': '#F57C00',     // 濃いオレンジ
  '素材・化学': '#039BE5',     // 明るい青
  '機械': '#546E7A',           // グレー青
  'その他': '#9E9E9E'          // グレー
};

// デフォルトの色配列（セクターが上記にない場合）
const defaultColors = [
  '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA',
  '#F4511E', '#00ACC1', '#AB47BC', '#6D4C41', '#F57C00',
  '#039BE5', '#546E7A', '#9E9E9E', '#3949AB', '#00897B',
  '#7CB342', '#FFB300', '#5D4037', '#757575', '#616161'
];

const SectorPieChart = () => {
  const theme = useTheme();
  const { portfolioData } = useContext(PortfolioContext);

  // React Hooksのルールに従い、useMemoをコンポーネントのトップレベルで呼び出す
  // 条件付きロジックはuseMemoの中に移動
  const chartData = useMemo(() => {
    // データが存在しない場合はnullを返す
    if (!portfolioData || !portfolioData.summary || !portfolioData.summary.sector_allocation) {
      return null;
    }
    
    const sectorData = portfolioData.summary.sector_allocation;
    const sectors = Object.keys(sectorData);
    
    // 各セクターの評価額と割合を計算
    const values = sectors.map(sector => sectorData[sector]);
    const total = values.reduce((sum, value) => sum + value, 0);
    const percentages = values.map(value => (value / total) * 100);
    
    // セクター別の色を設定
    const colors = sectors.map((sector, index) => 
      sectorColors[sector] || defaultColors[index % defaultColors.length]
    );
    
    return {
      labels: sectors,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color),
          borderWidth: 1,
          hoverOffset: 15
        }
      ],
      percentages
    };
  }, [portfolioData]);

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
          セクター情報がありません
        </Typography>
      </Paper>
    );
  }

  // グラフのオプション設定
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: theme.typography.fontFamily,
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => {
              // 未使用の'value'変数を削除し、直接datasets[0].data[i]を使用
              const percentage = chartData.percentages[i].toFixed(1);
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = chartData.percentages[context.dataIndex].toFixed(1);
            const formattedValue = new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY',
              maximumFractionDigits: 0
            }).format(value);
            return `${context.label}: ${formattedValue} (${percentage}%)`;
          }
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
        セクター別配分
      </Typography>
      
      <Box sx={{ flexGrow: 1, height: '300px', position: 'relative' }}>
        <Pie data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default SectorPieChart;