import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ChatBubble, Refresh, Send } from '@mui/icons-material';
import './Page2.css'; // 외부 CSS 파일 import

function Page2() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState(() => {
    const saved = sessionStorage.getItem('page2Conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);

  const dummyPoems = [
    "햇살이 흐드러진 오후,\n그대 향한 그리움이 피어난다.",
    "고요한 새벽 창가에서\n작은 숨결이 시가 된다.",
    "시간은 흐르고\n기억은 시처럼 남는다.",
    "낙엽 지는 골목길,\n사랑이 조용히 울고 있었다.",
    "외로운 달빛 아래,\n마음이 잔잔히 젖어든다.",
  ];

  useEffect(() => {
    sessionStorage.setItem('page2Conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userText = input.trim();
    setInput('');

    const newEntry = { user: userText, poem: null };
    setConversations((prev) => [...prev, newEntry]);

    setTimeout(() => {
      const generatedPoem = dummyPoems[Math.floor(Math.random() * dummyPoems.length)];
      setConversations((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1 ? { ...item, poem: generatedPoem } : item
        )
      );
    }, 1500);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    if (window.confirm('정말 초기화하시겠습니까?')) {
      setConversations([]);
      sessionStorage.removeItem('page2Conversations');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  return (
    <Box className="page2-container">
      <Box className="page2-top-toolbar">
        <Box className="page2-toolbar-left">
          <ChatBubble sx={{ fontSize: 15 }} />
          <Typography variant="subtitle1" fontSize={14}>시 생성</Typography>
        </Box>
        <IconButton onClick={handleReset} className="page2-reset-button">
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      <Box className="page2-messages-container">
        <Box className="page2-messages-inner">
          {conversations.map((conv, idx) => (
            <Box key={idx} className="page2-message-block">
              <Box className="page2-user-message">
                <Paper elevation={0} className="page2-message-paper-user">
                  <Typography className="page2-message-text">{conv.user}</Typography>
                </Paper>
              </Box>

              <Box className="page2-response-message">
                {conv.poem ? (
                  <Paper elevation={0} className="page2-message-paper-bot">
                    <Typography className="page2-message-text">{conv.poem}</Typography>
                  </Paper>
                ) : (
                  <Box className="page2-loading-box">
                    <CircularProgress size={36} sx={{ color: '#e5d9fc' }} />
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="page2-input-box">
        <TextField
          variant="standard"
          placeholder="일상어를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          multiline
          maxRows={4}
          fullWidth
          InputProps={{ disableUnderline: true }}
          className="page2-input-text"
        />
        <IconButton type="submit">
          <Send fontSize="small" sx={{ color: input.trim() ? '#7c3aed' : '#f9efff' }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Page2;