import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai";
import { followUpQuestionPrompt } from "@/lib/prompts";
import { ServerTiming } from "@/lib/serverTiming";

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

    const timing = new ServerTiming();
    const question = await timing.measure("llm", () => generateText(followUpQuestionPrompt(currentQuestion, answer)));

    return NextResponse.json(
      { question, isComplete: false },
      { headers: { "Server-Timing": timing.log("generate-question") } }
    );
  } catch (error) {
    console.error("generate-question error:", error);
    return NextResponse.json(
      { error: "질문 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
