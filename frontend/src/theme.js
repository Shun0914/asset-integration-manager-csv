/**
 * Material UIテーマ設定
 * アプリケーション全体のデザインテーマを定義します
 */
import { createTheme } from '@mui/material/styles';

// カスタムカラーパレット
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // 緑色 - 利益をイメージ
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5C6BC0', // インディゴ - 資産・安定をイメージ
      light: '#7986CB',
      dark: '#3949AB',
      contrastText: '#fff',
    },
    error: {
      main: '#D32F2F', // 赤色 - 損失をイメージ
      light: '#EF5350',
      dark: '#C62828',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#F5F5F5',
        },
      },
    },
  },
});

export default theme;
