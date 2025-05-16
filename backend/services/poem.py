import random


def generate_poem(prompt: str) -> str:
    dummy_poems = [
        "햇살이 흐드러진 오후,\n그대 향한 그리움이 피어난다.",
        "고요한 새벽 창가에서\n작은 숨결이 시가 된다.",
        "시간은 흐르고\n기억은 시처럼 남는다.",
        "낙엽 지는 골목길,\n사랑이 조용히 울고 있었다.",
        "외로운 달빛 아래,\n마음이 잔잔히 젖어든다.",
        f"{prompt} 속삭이는 바람처럼,\n가슴 깊이 스며든다.",
        f"{prompt} 끝자락에 피어난 마음,\n잊힌 계절의 향기를 품는다.",
    ]
    return random.choice(dummy_poems)
