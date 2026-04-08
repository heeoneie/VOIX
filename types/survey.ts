export interface Survey {
  id: string;
  title: string;
  description: string;
  initial_question: string;
  max_questions: number;
  created_at: string;
}

export interface Question {
  index: number;
  text: string;
  audio_url?: string;
}

export interface Answer {
  question_index: number;
  question_text: string;
  transcript: string;
  audio_url: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  answers: Answer[];
  status: "in_progress" | "completed";
  created_at: string;
  completed_at?: string;
}

export type SurveyPhase =
  | "idle"
  | "recording"
  | "uploading"
  | "transcribing"
  | "generating"
  | "speaking"
  | "completed"
  | "error";
