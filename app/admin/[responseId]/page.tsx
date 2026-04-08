import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Answer } from "@/types/survey";

export const dynamic = "force-dynamic";

export default async function ResponseDetailPage({
  params,
}: {
  params: { responseId: string };
}) {
  const supabase = createClient();
  const { data: response } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("id", params.responseId)
    .single();

  if (!response) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">응답을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const answers: Answer[] = response.answers ?? [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/admin"
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <h1 className="mb-2 text-2xl font-bold">
        응답 #{response.id.slice(0, 8)}
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {new Date(response.created_at).toLocaleString("ko-KR")}
      </p>

      <div className="flex flex-col gap-6">
        {answers.map((answer, i) => (
          <div key={i} className="rounded-lg border p-4">
            <p className="mb-1 text-sm font-medium text-gray-500">
              Q{answer.question_index + 1}. {answer.question_text}
            </p>
            <p className="text-lg">{answer.transcript}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
