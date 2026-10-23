import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";
import { ServerTiming } from "@/lib/serverTiming";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "text가 필요합니다." },
        { status: 400 }
      );
    }

    const timing = new ServerTiming();
    // 전체 음성이 생성될 때까지 기다리므로, 이 값이 스트리밍 전환 시 줄일 수 있는 대기 시간이다
    const audioBuffer = await timing.measure("tts", () => textToSpeech(text));

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Server-Timing": timing.log("tts"),
      },
    });
  } catch (error) {
    console.error("tts error:", error);
    return NextResponse.json(
      { error: "TTS 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
