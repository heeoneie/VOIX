"use client";

import { useEffect, useRef } from "react";
import { useSurveyStore } from "@/stores/surveyStore";

interface AudioPlayerProps {
  audioUrl: string | null;
  onPlaybackEnd: () => void;
}

export default function AudioPlayer({
  audioUrl,
  onPlaybackEnd,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phase = useSurveyStore((s) => s.phase);

  useEffect(() => {
    if (phase !== "speaking" || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = onPlaybackEnd;
    audio.onerror = onPlaybackEnd;
    audio.play().catch(onPlaybackEnd);

    return () => {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
    };
  }, [audioUrl, phase, onPlaybackEnd]);

  return null;
}
