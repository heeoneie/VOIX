"use client";

import { useSurveyStore } from "@/stores/surveyStore";

export default function QuestionDisplay() {
  const currentQuestion = useSurveyStore((s) => s.currentQuestion);
  const phase = useSurveyStore((s) => s.phase);
  const currentQuestionIndex = useSurveyStore((s) => s.currentQuestionIndex);

  if (!currentQuestion) return null;

  const phaseLabel: Record<string, string> = {
    idle: "준비 완료",
    recording: "듣고 있어요...",
    uploading: "답변 처리 중...",
    transcribing: "음성 인식 중...",
    generating: "다음 질문 생성 중...",
    speaking: "질문 중...",
    completed: "설문 완료",
    error: "오류 발생",
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="text-sm text-gray-500">
        질문 {currentQuestionIndex + 1}
      </span>
      <h2 className="text-2xl font-semibold leading-relaxed">
        {currentQuestion.text}
      </h2>
      <span className="rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-600">
        {phaseLabel[phase] ?? phase}
      </span>
    </div>
  );
}
