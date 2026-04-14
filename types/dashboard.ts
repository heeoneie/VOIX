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

export interface VoiceData {
  avg_response_duration_sec: number;
  avg_words_per_answer: number;
  engagement_score: number;
  confidence_distribution: { high: number; medium: number; low: number };
  completion_funnel: Array<{ question: string; responded: number }>;
}
