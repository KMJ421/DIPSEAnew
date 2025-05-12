import React, { useState, useEffect, useRef } from 'react';
import './Page1.css';
import { FaPaperPlane } from 'react-icons/fa';

function Page1() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('page1Messages');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);

  const videoUrls = [
    "https://www.youtube.com/embed/hlWiI4xVXKY",
    "https://www.youtube.com/embed/UFLyhzlG8FQ",
    "https://www.youtube.com/embed/n3McD-676Jw",
    "https://www.youtube.com/embed/XJ9Vylyk5Uw",
  ];

  useEffect(() => {
    sessionStorage.setItem('page1Messages', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];

    const newMessage = {
      text: input,
      videoUrl: randomVideo,
      showResult: true // ← 초기부터 결과 표시
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

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
    <div className="page1-chat-container">
      <div className="page1-chat-header">
        <h2>동영상 생성</h2>
        <button className="page1-reset-btn" onClick={handleReset}>리셋</button>
      </div>

      <div className="page1-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="page1-chat-message">
            <p>{msg.text}</p>

            {msg.showResult && (
              <div className="page1-video-wrapper">
                <iframe
                  width="100%"
                  height="300"
                  src={msg.videoUrl}
                  title="추천 동영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="page1-result-button-wrapper">
              <button
                className="page1-view-result-btn"
                onClick={() => toggleResult(idx)}
              >
                {msg.showResult ? "결과 닫기" : "결과 보기"}
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="page1-chat-input-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="시를 입력하세요"
          rows="2"
          required
        />
        <button type="submit">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default Page1;
