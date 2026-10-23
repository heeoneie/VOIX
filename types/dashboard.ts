export interface OverviewData {
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  avg_questions_per_response: number;
  avg_response_length: number;
  date_range: { from: string; to: string };
}

export interface SentimentData {
  overall_score: number;
  overall_label: string;
  distribution: { positive: number; neutral: number; negative: number };
  by_question: Array<{
    question_index: number;
    question_text: string;
    score: number;
    label: string;
  }>;
  key_positive_phrases: string[];
  key_negative_phrases: string[];
}

export interface TopicsData {
  themes: Array<{
    name: string;
    count: number;
    percentage: number;
    representative_quotes: string[];
  }>;
  keywords: Array<{
    word: string;
    frequency: number;
  }>;
}

// 모두 녹음 시간과 전사 텍스트로 계산한 실측값 (lib/voiceMetrics.ts)
export interface VoiceData {
  total_answers: number;
  measured_answers: number; // 녹음 시간이 기록된 답변 수
  avg_response_duration_sec: number | null;
  avg_words_per_answer: number; // 공백 기준 어절 수
  chars_per_sec: number | null; // 발화 속도 (공백 제외 글자 / 녹음 초)
  completion_funnel: Array<{ question: string; responded: number }>;
}
