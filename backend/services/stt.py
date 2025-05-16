import os
import torch
import torchaudio
import re
import subprocess
import numpy as np
from transformers import pipeline, WhisperProcessor

MODEL_DIR = "F:/Download/DIPSEA_STT/whisper_korean"
device_id = 0 if torch.cuda.is_available() else -1

print("[STT] 디바이스 설정 완료:", "GPU" if device_id == 0 else "CPU")

processor = WhisperProcessor.from_pretrained(MODEL_DIR)
print("[STT] WhisperProcessor 로드 완료")

asr = pipeline(
    "automatic-speech-recognition",
    model=MODEL_DIR,
    device=device_id,
    chunk_length_s=30,
    stride_length_s=(5, 5),
    framework="pt"
)
print("[STT] ASR 파이프라인 로드 완료")

gen_cfg = asr.model.generation_config
gen_cfg.forced_decoder_ids = None
gen_cfg.suppress_tokens = []
gen_cfg.begin_suppress_tokens = []
ko_token = processor.tokenizer.convert_tokens_to_ids("<|ko|>")
gen_cfg.decoder_start_token_id = ko_token
print("[STT] generation_config 설정 완료")

def transcribe(audio_path):
    try:
        print(f"[STT] 입력 오디오 경로: {audio_path}")

        try:
            audio_tensor, sr = torchaudio.load(audio_path)
            print(f"[STT] torchaudio 로드 성공: {sr}Hz")
        except:
            print("[STT] torchaudio 로드 실패 → ffmpeg로 변환 시도")
            tmp_wav = "tmp.wav"
            subprocess.run([
                "ffmpeg", "-y", "-i", audio_path,
                "-ar", "16000", "-ac", "1", tmp_wav
            ], check=True)
            audio_tensor, sr = torchaudio.load(tmp_wav)
            os.remove(tmp_wav)
            print("[STT] ffmpeg 변환 및 로드 성공")

        if sr != 16000:
            resampler = torchaudio.transforms.Resample(sr, 16000)
            audio_tensor = resampler(audio_tensor)
            print("[STT] 16kHz 리샘플링 수행 완료")

        audio = audio_tensor.squeeze().numpy()
        audio_input = {"array": audio, "sampling_rate": 16000}

        print("[STT] STT 변환 시작")
        result = asr(audio_input)
        print("[STT] STT 변환 완료")

        text = result["text"]
        korean_only = re.sub(r"[^가-힣\s]", "", text).strip()
        print("[STT] 최종 결과:", korean_only)

        return korean_only

    except Exception as e:
        print("[STT 오류]", e)
        return f"오류: {e}"
