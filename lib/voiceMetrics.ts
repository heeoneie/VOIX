import type { Answer } from "@/types/survey";
import type { VoiceData } from "@/types/dashboard";

// Voice Insight는 LLM 추정이 아니라 녹음 시간과 전사 텍스트로 직접 계산한다.
// duration_sec가 없는 답변(시드 데이터, 측정 도입 이전 응답)은 시간 지표에서 제외한다.
export function computeVoiceMetrics(responses: { answers?: Answer[] | null }[]): VoiceData {
  const answers = responses.flatMap((r) => r.answers ?? []);
  const timed = answers.filter(
    (a) => typeof a.duration_sec === "number" && a.duration_sec > 0
  );

  const round1 = (n: number) => Math.round(n * 10) / 10;
  const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
  const chars = (t: string) => t.replace(/\s/g, "").length;

  const totalDuration = timed.reduce((s, a) => s + a.duration_sec!, 0);
  const timedChars = timed.reduce((s, a) => s + chars(a.transcript), 0);

  // 질문 순번별로 답변한 응답자 수 (후속 질문은 응답자마다 문장이 달라 순번으로 묶는다)
  const maxIndex = Math.max(-1, ...answers.map((a) => a.question_index));
  const completion_funnel = Array.from({ length: maxIndex + 1 }, (_, i) => ({
    question: `Q${i + 1}`,
    responded: responses.filter((r) =>
      (r.answers ?? []).some((a) => a.question_index === i)
    ).length,
  }));

  return {
    total_answers: answers.length,
    measured_answers: timed.length,
    avg_response_duration_sec: timed.length ? round1(totalDuration / timed.length) : null,
    avg_words_per_answer: answers.length
      ? round1(answers.reduce((s, a) => s + words(a.transcript), 0) / answers.length)
      : 0,
    chars_per_sec: totalDuration > 0 ? round1(timedChars / totalDuration) : null,
    completion_funnel,
  };
}
