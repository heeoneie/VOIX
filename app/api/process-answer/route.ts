import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/gemini";

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

    // STT와 Storage 업로드를 Promise.all로 병렬 처리
    // → 사용자 응답 대기 시간 최소화를 위한 핵심 최적화
    const [sttResult, uploadResult] = await Promise.all([
      // STT: Gemini로 음성 텍스트 변환
      geminiModel.generateContent([
        {
          inlineData: {
            mimeType: "audio/webm",
            data: audioBuffer.toString("base64"),
          },
        },
        { text: "이 음성을 한국어 텍스트로 정확히 전사해주세요. 텍스트만 반환하세요." },
      ]),
      // Storage: Supabase에 음성 파일 업로드
      supabase.storage
        .from("voice-recordings")
        .upload(fileName, audioBuffer, {
          contentType: "audio/webm",
          upsert: false,
        }),
    ]);

    const transcript =
      sttResult.response.text()?.trim() ?? "";

    if (uploadResult.error) {
      throw new Error(`Storage 업로드 실패: ${uploadResult.error.message}`);
    }

    const {
      data: { publicUrl: audioUrl },
    } = supabase.storage.from("voice-recordings").getPublicUrl(fileName);

    return NextResponse.json({ transcript, audioUrl });
  } catch (error) {
    console.error("process-answer error:", error);
    return NextResponse.json(
      { error: "음성 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
