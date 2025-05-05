/**
 * GPTアドバイスパネルコンポーネント
 * ポートフォリオデータに基づいたGPTアドバイスを表示するコンポーネント
 */
import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PortfolioContext } from '../../context/PortfolioContext';
import { getGPTAdvice } from '../../services/api';
import ReactMarkdown from 'react-markdown';

const GPTAdvicePanel = () => {
  // コンテキストからポートフォリオデータを取得
  const { portfolioData, isLoading, setIsLoading, error, setError } = useContext(PortfolioContext);
  
  // ローカル状態
  const [advice, setAdvice] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState(null);
  const [adviceTimestamp, setAdviceTimestamp] = useState(null);
  const [expanded, setExpanded] = useState(true);
  
  // アドバイス取得関数
  const fetchAdvice = async (useCustomPrompt = false) => {
    // ポートフォリオデータがない場合は何もしない
    if (!portfolioData) {
      setAdviceError('ポートフォリオデータがありません。CSVファイルをアップロードしてください。');
      return;
    }
    
    try {
      setIsAdviceLoading(true);
      setAdviceError(null);
      
      // カスタムプロンプトの設定
      const promptToUse = useCustomPrompt ? customPrompt : null;
      
      // GPTアドバイスを取得
      const response = await getGPTAdvice(portfolioData, promptToUse);
      
      if (response.success) {
        setAdvice(response.advice);
        setAdviceTimestamp(response.timestamp);
      } else {
        setAdviceError(response.error || 'アドバイスの取得に失敗しました。');
      }
    } catch (err) {
      setAdviceError('アドバイスの取得中にエラーが発生しました: ' + (err.message || err));
    } finally {
      setIsAdviceLoading(false);
    }
  };
  
  // ポートフォリオデータが変更されたら、アドバイスを自動更新（オプション）
  // useEffect(() => {
  //   if (portfolioData) {
  //     fetchAdvice();
  //   }
  // }, [portfolioData]);
  
  // カスタムプロンプト送信ハンドラー
  const handleSubmitCustomPrompt = () => {
    if (customPrompt.trim()) {
      fetchAdvice(true);
    }
  };
  
  // カスタムプロンプト変更ハンドラー
  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
  };
  
  // アコーディオン開閉ハンドラー
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded);
  };
  
  // タイムスタンプをフォーマット
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ja-JP');
    } catch (e) {
      return timestamp;
    }
  };
  
  // ポートフォリオデータがない場合の表示
  if (!portfolioData) {
    return null;
  }
  
  return (
    <Paper elevation={3} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
      <Accordion
        expanded={expanded}
        onChange={handleAccordionChange('panel1')}
        sx={{ boxShadow: 'none' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">GPTアドバイス</Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {!advice && !isAdviceLoading && !adviceError && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  ポートフォリオについてGPTに分析・アドバイスを依頼できます
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => fetchAdvice()}
                  startIcon={<SmartToyIcon />}
                  sx={{ mt: 1 }}
                >
                  アドバイスを取得
                </Button>
              </Box>
            )}
            
            {isAdviceLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {adviceError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {adviceError}
              </Alert>
            )}
            
            {advice && (
              <Box>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => fetchAdvice()}
                    disabled={isAdviceLoading}
                  >
                    更新
                  </Button>
                  {adviceTimestamp && (
                    <Chip 
                      label={`生成日時: ${formatTimestamp(adviceTimestamp)}`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 3
                  }}
                >
                  <Box sx={{ 
                    '& p': { mt: 2, mb: 2 },
                    '& h1, & h2, & h3': { mt: 3, mb: 1 },
                    '& ul, & ol': { pl: 4 },
                    '& li': { mb: 1 }
                  }}>
                    <ReactMarkdown>
                      {advice}
                    </ReactMarkdown>
                  </Box>
                </Paper>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                カスタムプロンプト（オプション）
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="特定の質問や条件を入力してください。例: 「米国株の比率を増やすべきでしょうか？」「リスク耐性が低い場合のアドバイスを教えてください」"
                value={customPrompt}
                onChange={handleCustomPromptChange}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!customPrompt.trim() || isAdviceLoading}
                  onClick={handleSubmitCustomPrompt}
                >
                  カスタムプロンプトで質問
                </Button>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default GPTAdvicePanel;