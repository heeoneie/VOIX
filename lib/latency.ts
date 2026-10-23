// 한 턴(녹음 종료 → 다음 질문 음성 재생 시작)의 구간별 지연을 브라우저에서 잰다.
// 측정 결과는 콘솔에 턴마다 출력되고, window.__voixLatency.summary()로 평균·p50·p95를 볼 수 있다.

interface TurnTiming {
  turn: number;
  stages: Record<string, number>; // 클라이언트에서 잰 구간 (ms)
  server: Record<string, number>; // Server-Timing 헤더 값 (ms)
  total: number;
}

interface CurrentTurn {
  turn: number;
  start: number;
  last: number;
  stages: Record<string, number>;
  server: Record<string, number>;
}

const turns: TurnTiming[] = [];
let current: CurrentTurn | null = null;
let turnCount = 0;

function parseServerTiming(header: string | null): Record<string, number> {
  if (!header) return {};
  const result: Record<string, number> = {};
  for (const part of header.split(",")) {
    const [name, ...params] = part.trim().split(";");
    const dur = params.map((p) => p.trim()).find((p) => p.startsWith("dur="));
    if (name && dur) result[name.trim()] = Number(dur.slice(4));
  }
  return result;
}

// 사용자가 녹음 정지를 누른 순간
export function beginTurn() {
  const now = performance.now();
  turnCount += 1;
  current = { turn: turnCount, start: now, last: now, stages: {}, server: {} };
}

// 직전 지점부터 지금까지를 stage 구간으로 기록. res가 있으면 서버 구간도 함께 기록
export function lap(stage: string, res?: Response) {
  if (!current) return;
  const now = performance.now();
  current.stages[stage] = now - current.last;
  current.last = now;
  if (res) {
    for (const [name, dur] of Object.entries(
      parseServerTiming(res.headers.get("Server-Timing"))
    )) {
      current.server[`${stage}.${name}`] = dur;
    }
  }
}

// 다음 질문 음성이 실제로 재생되기 시작한 순간
export function endTurn() {
  if (!current) return;
  lap("playback");
  const timing: TurnTiming = {
    turn: current.turn,
    stages: current.stages,
    server: current.server,
    total: current.last - current.start,
  };
  current = null;
  turns.push(timing);
  console.info(
    `[latency] turn ${timing.turn}: 녹음 종료 → 다음 질문 재생 ${Math.round(timing.total)}ms`
  );
  console.table({ ...timing.stages, ...timing.server, total: timing.total });
}

// 오류나 설문 종료로 턴이 끝까지 가지 않은 경우
export function cancelTurn() {
  current = null;
}

function percentile(sorted: number[], p: number) {
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

export function summary() {
  const rows: Record<string, { n: number; avg: number; p50: number; p95: number }> = {};
  const keys = new Set<string>(["total"]);
  for (const t of turns) {
    Object.keys(t.stages).forEach((k) => keys.add(k));
    Object.keys(t.server).forEach((k) => keys.add(k));
  }
  for (const key of keys) {
    const values = turns
      .map((t) => (key === "total" ? t.total : t.stages[key] ?? t.server[key]))
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v))
      .sort((a, b) => a - b);
    if (values.length === 0) continue;
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    rows[key] = {
      n: values.length,
      avg: Math.round(avg),
      p50: Math.round(percentile(values, 50)),
      p95: Math.round(percentile(values, 95)),
    };
  }
  console.table(rows);
  return rows;
}

if (typeof window !== "undefined") {
  (window as unknown as { __voixLatency: unknown }).__voixLatency = {
    turns,
    summary,
    // 측정 결과를 JSON으로 복사해 둘 때 사용
    dump: () => JSON.stringify(turns, null, 2),
  };
}
