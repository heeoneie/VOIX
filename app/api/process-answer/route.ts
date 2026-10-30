import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribe } from "@/lib/ai";
import { ServerTiming } from "@/lib/serverTiming";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const surveyId = formData.get("surveyId") as string;

    if (!audioFile || !surveyId) {
      return NextResponse.json(
        { error: "audio와 surveyId가 필요합니다." },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `${surveyId}/${Date.now()}.webm`;

    const supabase = createClient();
    const timing = new ServerTiming();

    // STT와 Storage 업로드를 Promise.all로 병렬 처리
    // → 사용자 응답 대기 시간 최소화를 위한 핵심 최적화
    const [transcript, uploadResult] = await Promise.all([
      // STT: AI_PROVIDER로 고른 공급사로 음성 텍스트 변환
      timing.measure("stt", () => transcribe(audioBuffer, "audio/webm")),
      // Storage: Supabase에 음성 파일 업로드
      timing.measure("upload", async () =>
        supabase.storage
          .from("voice-recordings")
          .upload(fileName, audioBuffer, {
            contentType: "audio/webm",
            upsert: false,
          })
      ),
    ]);

    if (uploadResult.error) {
      throw new Error(`Storage 업로드 실패: ${uploadResult.error.message}`);
    }

    const {
      data: { publicUrl: audioUrl },
    } = supabase.storage.from("voice-recordings").getPublicUrl(fileName);

    return NextResponse.json(
      { transcript, audioUrl },
      { headers: { "Server-Timing": timing.log("process-answer") } }
    );
  } catch (error) {
    console.error("process-answer error:", error);
    return NextResponse.json(
      { error: "음성 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
