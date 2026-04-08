"use client";

import Link from "next/link";
import { useSurveyStore } from "@/stores/surveyStore";
import { CheckCircle } from "lucide-react";

export default function CompletePage() {
  const answers = useSurveyStore((s) => s.answers);
  const reset = useSurveyStore((s) => s.reset);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <CheckCircle size={64} className="text-green-500" />
      <h1 className="text-3xl font-bold">설문 완료!</h1>
      <p className="text-gray-600">
        총 {answers.length}개의 질문에 답해주셨습니다. 감사합니다.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
