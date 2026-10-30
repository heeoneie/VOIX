// 라우트와 지연 측정 스크립트가 같은 프롬프트를 쓰도록 분리
export function followUpQuestionPrompt(currentQuestion: string, answer: string): string {
  return `당신은 인터랙티브 설문 진행자입니다.
사용자의 답변을 바탕으로 자연스럽게 이어지는 후속 질문을 생성하세요.

이전 질문: ${currentQuestion}
사용자 답변: ${answer}

규칙:
- 답변 내용에 공감하면서 자연스럽게 이어지는 질문을 하세요.
- 질문은 한 문장으로, 친근한 말투로 작성하세요.
- 질문만 반환하세요. 다른 텍스트는 포함하지 마세요.`;
}
