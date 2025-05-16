import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.stt import transcribe  # 커스텀 Whisper STT 모델 사용

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'static/output'

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if 'file' not in request.files:
        return jsonify({"error": "파일 없음"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
    file.save(filepath)

    print("[업로드 완료]", filepath)
    return jsonify({"message": "저장 완료", "filename": unique_name})

@app.route("/stt-transcribe", methods=["POST"])
def stt_transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "파일이 없습니다"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(filepath)

    print("[STT 요청 수신됨]", filepath)

    try:
        transcript = transcribe(filepath)
        print("[STT 결과]", transcript)
        return jsonify({"transcript": transcript})
    except Exception as e:
        print("[STT 오류 발생]", e)
        return jsonify({"error": str(e)}), 500

# 선택적 분석 기능
try:
    from services.emotion import analyze_emotion
    from services.tts import generate_audio
    from services.poem import generate_poem
    from services.video import generate_video

    @app.route("/generate-poem-from-audio", methods=["POST"])
    def generate_poem_from_audio():
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
        file.save(filepath)

        transcript = transcribe(filepath)
        emotion = analyze_emotion(transcript)
        poem = generate_poem(emotion)
        output = generate_audio(poem, emotion, app.config['OUTPUT_FOLDER'])

        return jsonify({
            "transcript": transcript,
            "poem": poem,
            "output": f"/static/output/{output}"
        })

except ImportError:
    print("분석 관련 모듈이 설치되지 않아 분석 기능은 비활성화됩니다.")

if __name__ == '__main__':
    print("✅ Flask 서버가 시작되었습니다: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)
