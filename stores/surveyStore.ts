import { create } from "zustand";
import type { SurveyPhase, Question, Answer } from "@/types/survey";

// 한 턴: 녹음 → 업로드 → 전사 → 생성 → 발화. 여기에 없는 전환은 무시한다.
// error는 어느 단계에서나 setError로만 들어가고, retry로만 나온다.
const TRANSITIONS: Record<SurveyPhase, SurveyPhase[]> = {
  idle: ["recording"],
  recording: ["uploading"],
  uploading: ["transcribing"],
  transcribing: ["generating"],
  generating: ["speaking", "completed"],
  speaking: ["idle", "recording"],
  completed: [],
  error: [],
};

// 사용자 입력을 기다리는 단계. 여기 들어갈 때마다 복귀 지점을 저장한다.
const STABLE_PHASES: SurveyPhase[] = ["idle", "speaking"];

interface StableSnapshot {
  phase: SurveyPhase;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answerCount: number;
}

interface SurveyState {
  phase: SurveyPhase;
  surveyId: string | null;
  responseId: string | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answers: Answer[];
  error: string | null;
  lastStable: StableSnapshot | null;

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
  lastStable: null,

  startSurvey: (surveyId, initialQuestion) =>
    set({
      phase: "speaking",
      surveyId,
      currentQuestionIndex: 0,
      currentQuestion: initialQuestion,
      answers: [],
      error: null,
      lastStable: {
        phase: "speaking",
        currentQuestionIndex: 0,
        currentQuestion: initialQuestion,
        answerCount: 0,
      },
    }),

  setResponseId: (id) => set({ responseId: id }),

  setPhase: (phase) => {
    const state = get();
    if (!TRANSITIONS[state.phase].includes(phase)) {
      console.warn(`[survey] ignored transition ${state.phase} → ${phase}`);
      return;
    }
    set({
      phase,
      error: null,
      ...(STABLE_PHASES.includes(phase) && {
        lastStable: {
          phase,
          currentQuestionIndex: state.currentQuestionIndex,
          currentQuestion: state.currentQuestion,
          answerCount: state.answers.length,
        },
      }),
    });
  },

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setError: (error) => set({ phase: "error", error }),

  retry: () => {
    const { lastStable, answers } = get();
    if (!lastStable) {
      set({ phase: "idle", error: null });
      return;
    }
    // 에러 전 마지막 안정 상태로 복귀. 그 뒤에 쌓인 답변은 버려서 같은 질문에 다시 답해도 중복되지 않게 한다
    set({
      phase: lastStable.phase,
      currentQuestionIndex: lastStable.currentQuestionIndex,
      currentQuestion: lastStable.currentQuestion,
      answers: answers.slice(0, lastStable.answerCount),
      error: null,
    });
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
      lastStable: null,
    }),
}));
