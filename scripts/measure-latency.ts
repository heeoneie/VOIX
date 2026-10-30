// 설문 한 턴(STT → 후속 질문 생성 → TTS)의 구간별 지연을 잰다. Supabase 없이 라우트와 같은 함수를 직접 호출한다.
// 실행: npx tsx --env-file=.env.local scripts/measure-latency.ts <음성 샘플 폴더>
// 샘플 폴더에 NN.webm이 없으면 seed 답변을 OpenAI TTS로 읽혀 만든다(합성 음성이라 실제 녹음보다 깨끗하다).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateText, textToSpeech, transcribe } from "@/lib/ai";
import { OPENAI_TTS_MODEL } from "@/lib/openai";
import { followUpQuestionPrompt } from "@/lib/prompts";

type Sample = { question: string; answer: string };

// seed 라우트의 질문·답변 쌍을 그대로 쓴다
function loadSeedSamples(): Sample[] {
  const source = readFileSync(path.join(__dirname, "../app/api/seed/route.ts"), "utf8");
  const pattern = /question_text:\s*"([^"]+)",\s*transcript:\s*"([^"]+)"/g;
  return [...source.matchAll(pattern)].map(([, question, answer]) => ({ question, answer }));
}

async function ensureAudio(dir: string, index: number, text: string): Promise<Buffer> {
  const webm = path.join(dir, `${String(index).padStart(2, "0")}.webm`);
  if (!existsSync(webm)) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        "Content-Type": "application/json",
      },
      // 질문 음성(alloy)과 구분되도록 답변자는 다른 목소리로 만든다
      body: JSON.stringify({ model: OPENAI_TTS_MODEL, voice: "nova", input: text, response_format: "wav" }),
    });
    if (!response.ok) throw new Error(`샘플 생성 실패: ${response.status}`);
    const wav = webm.replace(/\.webm$/, ".wav");
    writeFileSync(wav, Buffer.from(await response.arrayBuffer()));
    // 브라우저 MediaRecorder와 같은 webm/opus로 맞춘다
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", wav, "-c:a", "libopus", "-b:a", "48k", webm]);
  }
  return readFileSync(webm);
}

// 스트리밍으로 받으면 첫 바이트가 언제 오는지 잰다(재생을 시작할 수 있는 시점)
async function ttsFirstByteMs(text: string): Promise<number> {
  const start = performance.now();
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: OPENAI_TTS_MODEL, voice: "alloy", input: text, response_format: "mp3" }),
  });
  if (!response.ok || !response.body) throw new Error(`TTS 스트리밍 실패: ${response.status}`);
  const reader = response.body.getReader();
  await reader.read();
  const elapsed = performance.now() - start;
  await reader.cancel();
  return elapsed;
}

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const value = await fn();
  return [value, performance.now() - start];
}

// 공백·문장부호를 뺀 글자 기준 편집 거리 / 원문 길이
function charErrorRate(reference: string, hypothesis: string): number {
  const norm = (s: string) => s.replace(/[\s.,!?~'"]/g, "");
  const a = [...norm(reference)];
  const b = [...norm(hypothesis)];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length] / a.length;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

async function main() {
  const dir = process.argv[2];
  if (!dir) throw new Error("음성 샘플 폴더를 인자로 주세요.");
  mkdirSync(dir, { recursive: true });

  console.log(`AI_PROVIDER=${process.env.AI_PROVIDER ?? "gemini"} TTS_PROVIDER=${process.env.TTS_PROVIDER ?? "elevenlabs"}`);
  const samples = loadSeedSamples();
  const rows: { stt: number; llm: number; tts: number; ttfb: number; cer: number }[] = [];

  for (const [i, sample] of samples.entries()) {
    const audio = await ensureAudio(dir, i, sample.answer);
    const [transcript, stt] = await timed(() => transcribe(audio, "audio/webm"));
    const [question, llm] = await timed(() => generateText(followUpQuestionPrompt(sample.question, transcript)));
    const [, tts] = await timed(() => textToSpeech(question));
    const ttfb = process.env.TTS_PROVIDER === "openai" ? await ttsFirstByteMs(question) : NaN;
    const cer = charErrorRate(sample.answer, transcript);
    rows.push({ stt, llm, tts, ttfb, cer });
    console.log(
      `#${i} stt=${stt.toFixed(0)}ms llm=${llm.toFixed(0)}ms tts=${tts.toFixed(0)}ms ttfb=${ttfb.toFixed(0)}ms cer=${(cer * 100).toFixed(1)}% → ${question}`
    );
  }

  const summary = (name: string, values: number[]) =>
    console.log(`${name.padEnd(12)} p50=${percentile(values, 50).toFixed(0)}ms p90=${percentile(values, 90).toFixed(0)}ms`);
  console.log(`\n${rows.length}턴`);
  summary("stt", rows.map((r) => r.stt));
  summary("llm", rows.map((r) => r.llm));
  summary("tts(전체)", rows.map((r) => r.tts));
  summary("턴 합계", rows.map((r) => r.stt + r.llm + r.tts));
  if (rows.every((r) => !Number.isNaN(r.ttfb))) {
    summary("tts(첫 바이트)", rows.map((r) => r.ttfb));
    summary("스트리밍 합계", rows.map((r) => r.stt + r.llm + r.ttfb));
  }
  const avgCer = rows.reduce((sum, r) => sum + r.cer, 0) / rows.length;
  console.log(`STT 글자 오류율 평균 ${(avgCer * 100).toFixed(1)}%`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
