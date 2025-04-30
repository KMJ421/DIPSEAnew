import React, { useState, useEffect, useRef } from 'react';
import './Page3.css';

function Page3() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('page3Messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null); // 현재 TTS 실행중인 index
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const videoUrls = [
    "https://www.youtube.com/embed/hlWiI4xVXKY",
    "https://www.youtube.com/embed/UFLyhzlG8FQ",
    "https://www.youtube.com/embed/n3McD-676Jw",
    "https://www.youtube.com/embed/XJ9Vylyk5Uw",
  ];

  useEffect(() => {
    sessionStorage.setItem('page3Messages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (text) => {
    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];

    const newMessage = {
      text,
      videoUrl: randomVideo,
      showResult: false,
    };

    setMessages((prev) => [...prev, newMessage]);

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
      sessionStorage.removeItem('page3Messages');
    }
  };

  const toggleVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          addMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        alert("음성 인식 중 오류가 발생했습니다: " + event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleTTS = (text, index) => {
    const synth = window.speechSynthesis;
    if (speakingIndex === index) {
      synth.cancel();
      setSpeakingIndex(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      synth.cancel(); // 기존 재생 중지
      synth.speak(utterance);
      setSpeakingIndex(index);
      utterance.onend = () => setSpeakingIndex(null);
    }
  };

  return (
    <div className="page3-chat-container">
      <div className="page3-chat-header">
        <h2>동영상 & 시 음성</h2>
        <button className="page3-reset-btn" onClick={handleReset}>리셋</button>
      </div>

      <div className="page3-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="page3-chat-message">
            <p>{msg.text}</p>

            <div className="page3-result-button-wrapper">
              <button
                className="page3-tts-btn"
                onClick={() => handleTTS(msg.text, idx)}
              >
                {speakingIndex === idx ? "🔊 중지" : "🔊 듣기"}
              </button>

              <button
                className="page3-view-result-btn"
                onClick={() => toggleResult(idx)}
              >
                {msg.showResult ? "결과 닫기" : "결과 보기"}
              </button>
            </div>

            {msg.showResult && (
              <div className="page3-video-wrapper">
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
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="page3-voice-input-area">
        <button
          className={`page3-mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoiceRecognition}
        >
          {isRecording ? '🛑 종료' : '🎤 말하기'}
        </button>
      </div>
    </div>
  );
}

export default Page3;
