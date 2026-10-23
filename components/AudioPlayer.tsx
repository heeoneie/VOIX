"use client";

import { useEffect, useRef } from "react";
import { useSurveyStore } from "@/stores/surveyStore";

interface AudioPlayerProps {
  audioUrl: string | null;
  onPlaybackEnd: () => void;
  onPlaybackStart?: () => void;
}

export default function AudioPlayer({
  audioUrl,
  onPlaybackEnd,
  onPlaybackStart,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phase = useSurveyStore((s) => s.phase);

  useEffect(() => {
    if (phase !== "speaking" || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplaying = () => onPlaybackStart?.();
    audio.onended = onPlaybackEnd;
    audio.onerror = onPlaybackEnd;
    audio.play().catch(onPlaybackEnd);

    return () => {
      audio.pause();
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
    };
  }, [audioUrl, phase, onPlaybackEnd, onPlaybackStart]);

  return null;
}
