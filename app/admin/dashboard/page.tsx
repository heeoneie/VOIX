import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  OverviewData,
  SentimentData,
  TopicsData,
  VoiceData,
} from "@/types/dashboard";
import StatCard from "./_components/StatCard";
import SentimentPieChart from "./_components/SentimentPieChart";
import ThemeBarChart from "./_components/ThemeBarChart";
import KeyPhrases from "./_components/KeyPhrases";
import KeywordCloud from "./_components/KeywordCloud";
import CompletionFunnel from "./_components/CompletionFunnel";
import { ArrowLeft, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const SURVEY_ID = "demo-skincare-001";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: insights } = await supabase
    .from("dashboard_insights")
    .select("*")
    .eq("survey_id", SURVEY_ID);

  const overview = insights?.find((i) => i.insight_type === "overview")
    ?.data as OverviewData | undefined;
  const sentiment = insights?.find((i) => i.insight_type === "sentiment")
    ?.data as SentimentData | undefined;
  const topics = insights?.find((i) => i.insight_type === "topics")
    ?.data as TopicsData | undefined;
  const voice = insights?.find((i) => i.insight_type === "voice")
    ?.data as VoiceData | undefined;

  if (!overview) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">분석 데이터가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-400">
            POST /api/analyze 를 호출하여 분석을 실행해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <header className="mb-10 flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              VOIX 브랜드 대시보드
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              글로우랩 스킨케어 설문 분석 &middot;{" "}
              {new Date(overview.date_range.from).toLocaleDateString("ko-KR")} ~{" "}
              {new Date(overview.date_range.to).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            응답 관리
          </Link>
        </div>
      </header>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="section-title">Global Overview</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="총 응답 수"
            value={overview.total_responses}
            sub="명"
            icon="users"
          />
          <StatCard
            label="완료율"
            value={`${overview.completion_rate}%`}
            icon="check"
            color="text-emerald-600"
          />
          <StatCard
            label="평균 질문 수"
            value={overview.avg_questions_per_response}
            sub="문항/응답"
            icon="message"
          />
          <StatCard
            label="평균 응답 길이"
            value={overview.avg_response_length}
            sub="자/답변"
            icon="text"
          />
        </div>
      </section>

      {/* Sentiment Analysis */}
      {sentiment && (
        <section className="mb-10">
          <h2 className="section-title">감성 분석</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="dashboard-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-500">
                  감성 분포
                </h3>
                <span
                  className={`badge ${
                    sentiment.overall_label === "긍정적"
                      ? "badge-green"
                      : sentiment.overall_label === "부정적"
                        ? "badge-red"
                        : "badge-yellow"
                  }`}
                >
                  전체: {sentiment.overall_label} (
                  {sentiment.overall_score.toFixed(2)})
                </span>
              </div>
              <SentimentPieChart distribution={sentiment.distribution} />
            </div>
            <div className="dashboard-card">
              <h3 className="mb-5 text-sm font-medium text-slate-500">
                핵심 표현
              </h3>
              <KeyPhrases
                positive={sentiment.key_positive_phrases}
                negative={sentiment.key_negative_phrases}
              />
            </div>
          </div>
        </section>
      )}

      {/* Topics Analysis */}
      {topics && (
        <section className="mb-10">
          <h2 className="section-title">주제 분석</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="dashboard-card">
              <h3 className="mb-4 text-sm font-medium text-slate-500">
                주요 주제별 응답 빈도
              </h3>
              <ThemeBarChart themes={topics.themes} />
            </div>
            <div className="dashboard-card">
              <h3 className="mb-5 text-sm font-medium text-slate-500">
                키워드 맵
              </h3>
              <KeywordCloud keywords={topics.keywords} />
            </div>
          </div>

          {/* Theme Details */}
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.themes.slice(0, 6).map((theme, i) => (
              <div
                key={i}
                className="dashboard-card group transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold leading-snug text-slate-800">
                    {theme.name}
                  </h4>
                  <span className="badge-blue shrink-0">
                    {theme.count}명 ({theme.percentage}%)
                  </span>
                </div>
                <div className="space-y-2">
                  {theme.representative_quotes?.map((quote, j) => (
                    <p
                      key={j}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600"
                    >
                      &ldquo;{quote}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Voice Insight */}
      {voice && (
        <section className="mb-10">
          <h2 className="section-title">Voice Insight</h2>
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="평균 응답 시간"
              value={`${voice.avg_response_duration_sec}초`}
              icon="clock"
              color="text-violet-600"
            />
            <StatCard
              label="평균 단어 수"
              value={voice.avg_words_per_answer}
              sub="단어/답변"
              icon="hash"
              color="text-violet-600"
            />
            <StatCard
              label="참여도 점수"
              value={`${voice.engagement_score}/100`}
              icon="zap"
              color="text-violet-600"
            />
            <div className="dashboard-card">
              <p className="mb-3 text-sm text-slate-500">응답 자신감 분포</p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "높음",
                    value: voice.confidence_distribution.high,
                    cls: "bg-emerald-500",
                    total:
                      voice.confidence_distribution.high +
                      voice.confidence_distribution.medium +
                      voice.confidence_distribution.low,
                  },
                  {
                    label: "보통",
                    value: voice.confidence_distribution.medium,
                    cls: "bg-amber-400",
                    total:
                      voice.confidence_distribution.high +
                      voice.confidence_distribution.medium +
                      voice.confidence_distribution.low,
                  },
                  {
                    label: "낮음",
                    value: voice.confidence_distribution.low,
                    cls: "bg-rose-400",
                    total:
                      voice.confidence_distribution.high +
                      voice.confidence_distribution.medium +
                      voice.confidence_distribution.low,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-slate-500">
                      {item.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.cls}`}
                        style={{
                          width: `${(item.value / item.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-5 text-right text-xs font-medium text-slate-700">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="mb-4 text-sm font-medium text-slate-500">
              질문별 응답 완료율
            </h3>
            <CompletionFunnel data={voice.completion_funnel} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        Powered by VOIX AI &middot; 음성 기반 인터랙티브 설문 분석
      </footer>
    </main>
  );
}
