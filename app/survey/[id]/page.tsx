"use client";

import { useCallback, useState } from "react";
import { useSurveyStore } from "@/stores/surveyStore";
import VoiceRecorder from "@/components/VoiceRecorder";
import AudioPlayer from "@/components/AudioPlayer";
import QuestionDisplay from "@/components/QuestionDisplay";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const {
    phase,
    currentQuestion,
    startSurvey,
    setPhase,
    addAnswer,
    setCurrentQuestion,
    setError,
    error,
    retry,
  } = useSurveyStore();

  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // 설문 시작
  const handleStart = useCallback(() => {
    const initialQuestion = {
      index: 0,
      text: "안녕하세요! 오늘 하루는 어떠셨나요?",
    };
    startSurvey(surveyId, initialQuestion);

    // 첫 질문 TTS
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: initialQuestion.text }),
    })
      .then((res) => res.blob())
      .then((blob) => setTtsAudioUrl(URL.createObjectURL(blob)))
      .catch(() => setError("TTS 생성에 실패했습니다."));
  }, [surveyId, startSurvey, setError]);

  // 녹음 완료 → 업로드 + STT → 다음 질문 생성 → TTS
  const handleRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      try {
        // 1. 음성 처리 (STT + Storage 병렬)
        setPhase("transcribing");
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("surveyId", surveyId);

        const processRes = await fetch("/api/process-answer", {
          method: "POST",
          body: formData,
        });
        if (!processRes.ok) throw new Error("음성 처리 실패");
        const { transcript, audioUrl } = await processRes.json();

        // 응답 저장
        addAnswer({
          question_index: currentQuestion!.index,
          question_text: currentQuestion!.text,
          transcript,
          audio_url: audioUrl,
        });

        // 2. 다음 질문 생성
        setPhase("generating");
        const genRes = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentQuestion: currentQuestion!.text,
            answer: transcript,
            questionIndex: currentQuestion!.index,
          }),
        });
        if (!genRes.ok) throw new Error("질문 생성 실패");
        const { question: nextQuestionText, isComplete } = await genRes.json();

        if (isComplete) {
          // DB에 설문 결과 저장
          const answers = useSurveyStore.getState().answers;
          const saveRes = await fetch("/api/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              survey_id: surveyId,
              answers,
              status: "completed",
            }),
          });
          if (!saveRes.ok) throw new Error("응답 저장 실패");
          setPhase("completed");
          router.push(`/survey/${surveyId}/complete`);
          return;
        }

        const nextQuestion = {
          index: currentQuestion!.index + 1,
          text: nextQuestionText,
        };
        setCurrentQuestion(nextQuestion);

        // 3. TTS
        setPhase("speaking");
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: nextQuestionText }),
        });
        if (!ttsRes.ok) throw new Error("TTS 실패");
        const ttsBlob = await ttsRes.blob();
        setTtsAudioUrl(URL.createObjectURL(ttsBlob));
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      }
    },
    [
      surveyId,
      currentQuestion,
      setPhase,
      addAnswer,
      setCurrentQuestion,
      setError,
      router,
    ]
  );

  const handlePlaybackEnd = useCallback(() => {
    setPhase("idle");
  }, [setPhase]);

  // 아직 시작 안 한 상태
  if (phase === "idle" && !currentQuestion) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-3xl font-bold">VOIX 설문</h1>
        <p className="text-gray-600">
          음성으로 대화하듯 설문에 답해주세요.
        </p>
        <button
          onClick={handleStart}
          className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-medium text-white transition hover:bg-blue-700"
        >
          시작하기
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <QuestionDisplay />

      <VoiceRecorder onRecordingComplete={handleRecordingComplete} />

      <AudioPlayer audioUrl={ttsAudioUrl} onPlaybackEnd={handlePlaybackEnd} />

      {phase === "error" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-500">{error}</p>
          <button
            onClick={retry}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
        </div>
      )}
    </main>
  );
}
