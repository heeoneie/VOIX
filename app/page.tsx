import Link from "next/link";
import { Mic } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Mic size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">VOIX</h1>
        <p className="max-w-md text-center text-lg text-gray-600">
          음성으로 대화하듯 답하는 인터랙티브 설문 시스템
        </p>
      </div>

      <Link
        href="/survey/demo"
        className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-medium text-white transition hover:bg-blue-700"
      >
        설문 시작하기
      </Link>

      <Link
        href="/admin"
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        관리자 페이지
      </Link>
    </main>
  );
}
