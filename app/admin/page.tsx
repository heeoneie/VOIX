import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: responses } = await supabase
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">응답 관리</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            대시보드
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 py-2">
            홈으로
          </Link>
        </div>
      </div>

      {!responses || responses.length === 0 ? (
        <p className="text-gray-500">아직 응답이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {responses.map((response) => (
            <Link
              key={response.id}
              href={`/admin/${response.id}`}
              className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50"
            >
              <div>
                <span className="font-medium">응답 #{response.id.slice(0, 8)}</span>
                <span className="ml-3 text-sm text-gray-500">
                  {new Date(response.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  response.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {response.status === "completed" ? "완료" : "진행중"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
