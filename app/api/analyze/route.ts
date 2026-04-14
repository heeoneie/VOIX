import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { survey_id } = await request.json();
    if (!survey_id) {
      return NextResponse.json(
        { error: "survey_id가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. 응답 데이터 조회
    const { data: responses, error: fetchError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("survey_id", survey_id);

    if (fetchError) throw fetchError;
    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { error: "응답 데이터가 없습니다." },
        { status: 404 }
      );
    }

    // 2. 응답 텍스트 정리
    const allAnswers = responses.flatMap((r) => r.answers ?? []);
    const answersText = allAnswers
      .map(
        (a: { question_index: number; question_text: string; transcript: string }) =>
          `[Q${a.question_index + 1}] ${a.question_text}\n[A] ${a.transcript}`
      )
      .join("\n\n");

    // 3. Overview 직접 계산
    const completed = responses.filter((r) => r.status === "completed");
    const avgQuestions =
      responses.reduce((sum, r) => sum + (r.answers?.length ?? 0), 0) /
      responses.length;
    const avgLength =
      allAnswers.reduce(
        (sum: number, a: { transcript: string }) => sum + a.transcript.length,
        0
      ) / allAnswers.length;
    const dates = responses.map((r) => new Date(r.created_at).getTime());

    const overviewData = {
      total_responses: responses.length,
      completed_responses: completed.length,
      completion_rate: Math.round((completed.length / responses.length) * 100),
      avg_questions_per_response: Math.round(avgQuestions * 10) / 10,
      avg_response_length: Math.round(avgLength),
      date_range: {
        from: new Date(Math.min(...dates)).toISOString(),
        to: new Date(Math.max(...dates)).toISOString(),
      },
    };

    // 4. Gemini 분석 (순차 처리 - rate limit 방지)
    const sentimentResult = await geminiModel.generateContent([
      {
        text: `다음은 스킨케어 브랜드의 음성 설문 응답 데이터입니다. 각 응답의 감성을 분석해주세요.

${answersText}

다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 포함하지 마세요:
{
  "overall_score": (number, -1.0 ~ 1.0),
  "overall_label": ("긍정적" | "중립" | "부정적"),
  "distribution": { "positive": (긍정 응답자 수), "neutral": (중립 응답자 수), "negative": (부정 응답자 수) },
  "by_question": [
    { "question_index": 0, "question_text": "질문", "score": 0.7, "label": "긍정적" }
  ],
  "key_positive_phrases": ["긍정 표현 5개"],
  "key_negative_phrases": ["부정/아쉬움 표현 5개"]
}`,
      },
    ]);

    const topicsResult = await geminiModel.generateContent([
      {
        text: `다음 음성 설문 응답에서 핵심 주제와 키워드를 추출해주세요.

${answersText}

다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 포함하지 마세요:
{
  "themes": [
    {
      "name": "주제명",
      "count": (해당 주제를 언급한 응답자 수, 총 ${responses.length}명 중),
      "percentage": (퍼센트),
      "representative_quotes": ["대표 인용 2개"]
    }
  ],
  "keywords": [
    { "word": "키워드", "frequency": (빈도수) }
  ]
}
주제는 5-7개, 키워드는 10-15개를 추출하세요.`,
      },
    ]);

    const voiceResult = await geminiModel.generateContent([
      {
        text: `다음 음성 설문 데이터를 기반으로 음성 인터랙션 관련 인사이트를 생성해주세요.
각 응답의 텍스트 길이와 상세도를 기반으로 참여도를 추정하세요.
총 응답자: ${responses.length}명, 질문당 평균 답변 길이: ${Math.round(avgLength)}자

${answersText}

다음 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 포함하지 마세요:
{
  "avg_response_duration_sec": (추정 평균 응답 시간, 초),
  "avg_words_per_answer": (평균 단어 수),
  "engagement_score": (0-100 참여도 점수),
  "confidence_distribution": { "high": (수), "medium": (수), "low": (수) },
  "completion_funnel": [
    { "question": "Q1 질문 요약", "responded": ${responses.length} },
    { "question": "Q2 질문 요약", "responded": (수) }
  ]
}`,
      },
    ]);

    // JSON 파싱 헬퍼
    const parseJSON = (text: string) => {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    };

    const sentimentData = parseJSON(sentimentResult.response.text() ?? "{}");
    const topicsData = parseJSON(topicsResult.response.text() ?? "{}");
    const voiceData = parseJSON(voiceResult.response.text() ?? "{}");

    // 5. 기존 인사이트 삭제 후 저장
    await supabase
      .from("dashboard_insights")
      .delete()
      .eq("survey_id", survey_id);

    const { error: insertError } = await supabase
      .from("dashboard_insights")
      .insert([
        { survey_id, insight_type: "overview", data: overviewData },
        { survey_id, insight_type: "sentiment", data: sentimentData },
        { survey_id, insight_type: "topics", data: topicsData },
        { survey_id, insight_type: "voice", data: voiceData },
      ]);

    if (insertError) throw insertError;

    return NextResponse.json({
      message: "분석 완료",
      overview: overviewData,
      sentiment: sentimentData,
      topics: topicsData,
      voice: voiceData,
    });
  } catch (error) {
    console.error("analyze error:", error);
    return NextResponse.json(
      { error: "분석에 실패했습니다." },
      { status: 500 }
    );
  }
}
