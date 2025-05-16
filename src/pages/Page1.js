import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Videocam, Refresh, Send, ExpandMore } from '@mui/icons-material';
import './Page1.css';

function Page1() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('page1Messages');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);

  const videoUrls = [
    'https://www.youtube.com/embed/hlWiI4xVXKY',
    'https://www.youtube.com/embed/UFLyhzlG8FQ',
    'https://www.youtube.com/embed/n3McD-676Jw',
    'https://www.youtube.com/embed/XJ9Vylyk5Uw',
  ];

  useEffect(() => {
    sessionStorage.setItem('page1Messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newMessage = {
      text: input,
      videoUrl: null,
      loading: true,
      showResult: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    setTimeout(() => {
      const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? { ...msg, videoUrl: randomVideo, loading: false }
            : msg
        )
      );
    }, 1500);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleResult = (index) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, showResult: !msg.showResult } : msg
      )
    );
  };

  const handleReset = () => {
    if (window.confirm('정말 초기화하시겠습니까?')) {
      setMessages([]);
      sessionStorage.removeItem('page1Messages');
    }
  };

  return (
    <Box className="page1-container">
      <Box className="page1-top-toolbar">
        <Box className="page1-toolbar-left">
          <Videocam fontSize="small" />
          <Typography variant="subtitle1" fontSize={14}>
            동영상 생성
          </Typography>
        </Box>
        <IconButton onClick={handleReset} className="page1-reset-button">
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      <Box className="page1-messages-container">
        <Box className="page1-messages-inner">
          {messages.map((msg, idx) => (
            <Box key={idx} className="page1-message-block">
              <Box className="page1-user-message">
                <Paper elevation={0} className="page1-message-paper">
                  <Typography className="page1-message-text">{msg.text}</Typography>
                </Paper>
              </Box>

              {msg.showResult && (
                <Box className="page1-result-container">
                  <Box className="page1-video-wrapper">
                    {msg.loading ? (
                      <CircularProgress size={64} sx={{ color: '#e5d9fc' }} />
                    ) : (
                      <iframe
                        width="100%"
                        height="350"
                        src={msg.videoUrl}
                        title="추천 동영상"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      ></iframe>
                    )}
                  </Box>
                </Box>
              )}

              <Box className="page1-toggle-button">
                <IconButton
                  size="small"
                  onClick={() => toggleResult(idx)}
                  style={{
                    transform: msg.showResult ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                    color: '#555',
                  }}
                >
                  <ExpandMore fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="page1-input-box">
        <TextField
          variant="standard"
          placeholder="시 입력"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          multiline
          maxRows={4}
          fullWidth
          InputProps={{ disableUnderline: true }}
          className="page1-input-text"
        />
        <IconButton type="submit">
          <Send fontSize="small" sx={{ color: input.trim() ? '#7c3aed' : '#f9efff' }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Page1;
