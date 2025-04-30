import React, { useState, useRef, useEffect } from 'react';
import './Page2.css';
import { FaPaperPlane } from 'react-icons/fa';

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
    }, 1000);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  return (
    <div className="page2-chat-container">
      <div className="page2-chat-header">
        <h2>시 생성</h2>
        <button className="page2-reset-btn" onClick={handleReset}>리셋</button>
      </div>

      <div className="page2-chat-messages">
        {conversations.map((conv, idx) => (
          <div key={idx} className="conversation-block">
            <div className="chat-message user-message">
              <div className="bubble">{conv.user}</div>
            </div>
            <div className="chat-message bot-message">
              <div className="bubble">
                {conv.poem ? (
                  conv.poem
                ) : (
                  <span style={{ color: '#888', fontStyle: 'italic' }}>시를 생성 중입니다</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="page2-chat-input-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="일상어를 입력하세요"
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

export default Page2;
