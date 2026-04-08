"use client";

import { useRef, useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { useSurveyStore } from "@/stores/surveyStore";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({
  onRecordingComplete,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const phase = useSurveyStore((s) => s.phase);
  const setPhase = useSurveyStore((s) => s.setPhase);
  const setError = useSurveyStore((s) => s.setError);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setPhase("recording");
    } catch {
      setError("마이크 접근 권한이 필요합니다.");
    }
  }, [onRecordingComplete, setPhase, setError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setPhase("uploading");
    }
  }, [setPhase]);

  const isRecording = phase === "recording";
  const canRecord = phase === "idle" || phase === "speaking";

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={!canRecord && !isRecording}
      className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
        isRecording
          ? "animate-pulse bg-red-500 text-white"
          : canRecord
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "cursor-not-allowed bg-gray-300 text-gray-500"
      }`}
    >
      {isRecording ? <Square size={32} /> : <Mic size={32} />}
    </button>
  );
}
