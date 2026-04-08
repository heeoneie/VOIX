import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "text가 필요합니다." },
        { status: 400 }
      );
    }

    const audioBuffer = await textToSpeech(text);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
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
