import React, { useState, useEffect, useRef } from 'react';
import './Page4.css';
import ClipLoader from 'react-spinners/ClipLoader';

function Page4() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('Page4Messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const videoUrls = [
    "https://www.youtube.com/embed/hlWiI4xVXKY",
    "https://www.youtube.com/embed/UFLyhzlG8FQ",
    "https://www.youtube.com/embed/n3McD-676Jw",
    "https://www.youtube.com/embed/XJ9Vylyk5Uw",
  ];

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    sessionStorage.setItem('Page4Messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading]);

  const addMessage = (text) => {
    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const newMessage = {
      text,
      videoUrl: randomVideo,
      showResult: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const uploadAudioToServer = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, `recording_${Date.now()}.wav`);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/stt-transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('STT 변환 실패');

      const data = await res.json();
      if (data.transcript) {
        addMessage(data.transcript);
      } else {
        addMessage(`오류: ${data.error}`);
        console.error('변환 실패:', data.error);
      }
    } catch (err) {
      console.error('업로드/변환 실패:', err);
      addMessage(`오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      window.recognition?.stop();
      window.mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

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
        console.log("브라우저 인식 결과:", transcript);
      };

      recognition.onerror = (event) => {
        console.error("인식 오류:", event.error);
        recognition.stop();
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());
        await uploadAudioToServer(blob);
        setIsRecording(false);
      };

      window.mediaRecorder = mediaRecorder;
      window.recognition = recognition;

      mediaRecorder.start();
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      alert("녹음 오류: " + err.message);
      setIsRecording(false);
    }
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
        <h2>음성 → 텍스트 + 업로드 + TTS</h2>
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

            {msg.showResult && msg.videoUrl && (
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

        {loading && (
          <div className="Page4-loading">
            <ClipLoader color="#7e7b7b" loading={true} size={80} />
            <p>결과 생성 중입니다</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="Page4-voice-input-area">
        <button
          className={`Page4-mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoiceRecording}
        >
          {isRecording ? '🛑 종료' : '🎤 말하기'}
        </button>
      </div>
    </div>
  );
}

export default Page4;
