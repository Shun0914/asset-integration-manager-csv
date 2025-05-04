/**
 * ポートフォリオテーブルコンポーネント
 * 保有銘柄一覧をテーブル形式で表示
 */
import React, { useContext, useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Chip
} from '@mui/material';
import { PortfolioContext } from '../../context/PortfolioContext';

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

const formatNumber = (value) => {
  return new Intl.NumberFormat('ja-JP').format(value);
};

// テーブルヘッダー定義
const headCells = [
  { id: 'code', label: '証券コード', sortable: true },
  { id: 'name', label: '銘柄名', sortable: true },
  { id: 'sector', label: 'セクター', sortable: true },
  { id: 'quantity', label: '保有数量', sortable: true, numeric: true },
  { id: 'cost_price', label: '取得単価', sortable: true, numeric: true },
  { id: 'current_price', label: '現在価格', sortable: true, numeric: true },
  { id: 'value', label: '評価額', sortable: true, numeric: true },
  { id: 'profit_loss', label: '損益', sortable: true, numeric: true },
  { id: 'profit_loss_rate', label: '損益率', sortable: true, numeric: true }
];

const PortfolioTable = () => {
  // コンテキストからポートフォリオデータを取得
  const { portfolioData } = useContext(PortfolioContext);
  
  // ソート状態
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('code');
  
  // ページネーション状態
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // データが存在しない場合はレンダリングしない
  if (!portfolioData || !portfolioData.items || portfolioData.items.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ポートフォリオデータがありません。CSVファイルをアップロードしてください。
        </Typography>
      </Paper>
    );
  }

  const { items } = portfolioData;

  // ソート関数
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // ソート比較関数
  const descendingComparator = (a, b, orderBy) => {
    // nullチェック
    if (b[orderBy] === null || b[orderBy] === undefined) return -1;
    if (a[orderBy] === null || a[orderBy] === undefined) return 1;
    
    // 文字列か数値かによって比較方法を変える
    if (typeof a[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    } else {
      return b[orderBy] - a[orderBy];
    }
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // ソート適用
  const sortedItems = [...items].sort(getComparator(order, orderBy));

  // ページネーション処理
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ページネーション適用
  const paginatedItems = sortedItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="ポートフォリオテーブル">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'background.paper',
                    borderBottom: '2px solid',
                    borderBottomColor: 'primary.light'
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((row, index) => (
              <TableRow
                key={row.code + index}
                hover
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.2s',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.sector ? (
                    <Chip 
                      label={row.sector} 
                      size="small" 
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  ) : 'N/A'}
                </TableCell>
                <TableCell align="right">{formatNumber(row.quantity)}</TableCell>
                <TableCell align="right">{formatCurrency(row.cost_price)}</TableCell>
                <TableCell align="right">{formatCurrency(row.current_price)}</TableCell>
                <TableCell align="right">{formatCurrency(row.value)}</TableCell>
                <TableCell 
                  align="right"
                  sx={{
                    color: row.profit_loss > 0 
                      ? 'success.main' 
                      : row.profit_loss < 0 
                        ? 'error.main' 
                        : 'text.primary',
                    fontWeight: 'medium'
                  }}
                >
                  {formatCurrency(row.profit_loss)}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{
                    color: row.profit_loss_rate > 0 
                      ? 'success.main' 
                      : row.profit_loss_rate < 0 
                        ? 'error.main' 
                        : 'text.primary',
                    fontWeight: 'medium'
                  }}
                >
                  {formatPercent(row.profit_loss_rate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={items.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} / ${count !== -1 ? count : `${to}以上`}`
        }
      />
    </Paper>
  );
};

export default PortfolioTable;