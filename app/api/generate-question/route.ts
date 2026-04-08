import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

const MAX_QUESTIONS = 5;

export async function POST(request: NextRequest) {
  try {
    const { currentQuestion, answer, questionIndex = 0 } = await request.json();

    if (!currentQuestion || !answer) {
      return NextResponse.json(
        { error: "currentQuestion과 answer가 필요합니다." },
        { status: 400 }
      );
    }

    // 마지막 질문이면 완료
    if (questionIndex >= MAX_QUESTIONS - 1) {
      return NextResponse.json({ question: null, isComplete: true });
    }

    const result = await geminiModel.generateContent([
      {
        text: `당신은 인터랙티브 설문 진행자입니다.
사용자의 답변을 바탕으로 자연스럽게 이어지는 후속 질문을 생성하세요.

이전 질문: ${currentQuestion}
사용자 답변: ${answer}

규칙:
- 답변 내용에 공감하면서 자연스럽게 이어지는 질문을 하세요.
- 질문은 한 문장으로, 친근한 말투로 작성하세요.
- 질문만 반환하세요. 다른 텍스트는 포함하지 마세요.`,
      },
    ]);

    const question = result.response.text()?.trim() ?? "";

    return NextResponse.json({ question, isComplete: false });
  } catch (error) {
    console.error("generate-question error:", error);
    return NextResponse.json(
      { error: "질문 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
