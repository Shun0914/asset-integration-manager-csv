/**
 * CSVファイルアップロードコンポーネント
 * ドラッグ＆ドロップによるCSVファイルのアップロード機能を提供
 */
import React, { useState, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { PortfolioContext } from '../../context/PortfolioContext';
import { uploadCSV, getSamplePortfolio } from '../../services/api';

const FileUpload = () => {
  // コンテキストからポートフォリオ状態を取得
  const { 
    setPortfolioData, 
    isLoading, 
    setIsLoading, 
    error, 
    setError 
  } = useContext(PortfolioContext);
  
  // ローカル状態
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // ファイルドロップのハンドラー
  const onDrop = useCallback(acceptedFiles => {
    // 最初のファイルのみ処理
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // CSVファイルかどうかの検証
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('CSVファイル以外はアップロードできません。');
      }
    }
  }, [setError]);

  // react-dropzoneフックの設定
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB制限
  });

  // ファイルアップロードの処理
  const handleUpload = async () => {
    if (!file) {
      setError('ファイルが選択されていません。');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // APIにファイルをアップロード
      const response = await uploadCSV(file);

      if (response.success) {
        // 成功時の処理
        setPortfolioData(response.data);
        setNotification({
          open: true,
          message: 'CSVファイルの解析が完了しました。',
          severity: 'success'
        });
      } else {
        // エラー時の処理
        setError(response.message || 'アップロード中にエラーが発生しました。');
      }
    } catch (err) {
      setError('アップロード中にエラーが発生しました: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // サンプルデータを読み込む処理
  const handleLoadSample = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // サンプルデータをAPIから取得
      const response = await getSamplePortfolio();

      if (response.success) {
        // 成功時の処理
        setPortfolioData(response.data);
        setNotification({
          open: true,
          message: 'サンプルデータが読み込まれました。',
          severity: 'info'
        });
      } else {
        // エラー時の処理
        setError(response.message || 'サンプルデータの読み込みに失敗しました。');
      }
    } catch (err) {
      setError('サンプルデータの読み込みに失敗しました: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // 通知を閉じる処理
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ my: 2 }}>
      <Paper 
        {...getRootProps()} 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <input {...getInputProps()} />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isDragActive ? 'primary.main' : 'text.secondary'
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 60, mb: 2 }} />
          {isDragActive ? (
            <Typography variant="h6">ファイルをドロップしてください</Typography>
          ) : (
            <>
              <Typography variant="h6">
                CSVファイルをドラッグ＆ドロップ
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                または、クリックしてファイルを選択
              </Typography>
            </>
          )}
        </Box>
      </Paper>
      
      {file && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <InsertDriveFileIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">{file.name}</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleLoadSample}
          disabled={isLoading}
        >
          サンプルデータを使用
        </Button>
        
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          elevation={6} 
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUpload;