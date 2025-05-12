import React, { useState, useEffect, useRef } from 'react';
import './Page4.css';

function Page4() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('Page4Messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const videoUrls = [
    "https://www.youtube.com/embed/hlWiI4xVXKY",
    "https://www.youtube.com/embed/UFLyhzlG8FQ",
    "https://www.youtube.com/embed/n3McD-676Jw",
    "https://www.youtube.com/embed/XJ9Vylyk5Uw",
  ];

  useEffect(() => {
    sessionStorage.setItem('Page4Messages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (text) => {
    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const newMessage = {
      text,
      videoUrl: randomVideo,
      showResult: true, // 처음부터 결과 보이도록
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
      sessionStorage.removeItem('Page4Messages');
    }
  };

  const toggleVoiceRecognition = async () => {
    if (isRecording) {
      setIsRecording(false);
      return; // 이 로직에선 stop이 필요 없음
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recording_${Date.now()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        stream.getTracks().forEach(track => track.stop());
      };

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          addMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        alert("음성 인식 오류: " + event.error);
      };

      recognition.onend = () => {
        mediaRecorder.stop();
        setIsRecording(false);
      };

      mediaRecorder.start();
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      alert("녹음 오류: " + err.message);
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
      synth.cancel();
      synth.speak(utterance);
      setSpeakingIndex(index);
      utterance.onend = () => setSpeakingIndex(null);
    }
  };

  return (
    <div className="Page4-chat-container">
      <div className="Page4-chat-header">
        <h2>음성 → 영상 + TTS</h2>
        <button className="Page4-reset-btn" onClick={handleReset}>리셋</button>
      </div>

      <div className="Page4-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="Page4-chat-message">
            <p>{msg.text}</p>
            <div className="Page4-result-button-wrapper">
              <button
                className="Page4-tts-btn"
                onClick={() => handleTTS(msg.text, idx)}
              >
                {speakingIndex === idx ? "🔊 중지" : "🔊 듣기"}
              </button>
              <button
                className="Page4-view-result-btn"
                onClick={() => toggleResult(idx)}
              >
                {msg.showResult ? "결과 닫기" : "결과 보기"}
              </button>
            </div>
            {msg.showResult && (
              <div className="Page4-video-wrapper">
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

      <div className="Page4-voice-input-area">
        <button
          className={`Page4-mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoiceRecognition}
        >
          {isRecording ? '🛑 종료' : '🎤 말하기'}
        </button>
      </div>
    </div>
  );
}

export default Page4;
