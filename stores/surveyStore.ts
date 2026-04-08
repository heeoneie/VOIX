import { create } from "zustand";
import type { SurveyPhase, Question, Answer } from "@/types/survey";

interface SurveyState {
  phase: SurveyPhase;
  surveyId: string | null;
  responseId: string | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answers: Answer[];
  error: string | null;

  // Actions
  startSurvey: (surveyId: string, initialQuestion: Question) => void;
  setResponseId: (id: string) => void;
  setPhase: (phase: SurveyPhase) => void;
  addAnswer: (answer: Answer) => void;
  setCurrentQuestion: (question: Question) => void;
  setError: (error: string) => void;
  retry: () => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  phase: "idle",
  surveyId: null,
  responseId: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  answers: [],
  error: null,

  startSurvey: (surveyId, initialQuestion) =>
    set({
      phase: "speaking",
      surveyId,
      currentQuestionIndex: 0,
      currentQuestion: initialQuestion,
      answers: [],
      error: null,
    }),

  setResponseId: (id) => set({ responseId: id }),

  setPhase: (phase) => set({ phase, error: null }),

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setError: (error) => set({ phase: "error", error }),

  retry: () => {
    const { answers } = get();
    // 에러 발생 전 마지막 안정 상태로 복귀
    if (answers.length === 0) {
      set({ phase: "idle", error: null });
    } else {
      set({ phase: "speaking", error: null });
    }
  },

  reset: () =>
    set({
      phase: "idle",
      surveyId: null,
      responseId: null,
      currentQuestionIndex: 0,
      currentQuestion: null,
      answers: [],
      error: null,
    }),
}));
