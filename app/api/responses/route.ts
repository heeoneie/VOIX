import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 응답 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        survey_id: body.survey_id,
        answers: body.answers,
        status: body.status ?? "in_progress",
        ...(body.status === "completed" && { completed_at: new Date().toISOString() }),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("responses POST error:", error);
    return NextResponse.json(
      { error: "응답 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 응답 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId");
    const supabase = createClient();

    let query = supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (surveyId) {
      query = query.eq("survey_id", surveyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("responses GET error:", error);
    return NextResponse.json(
      { error: "응답 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
