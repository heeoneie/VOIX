// 서버 구간별 소요 시간을 재서 Server-Timing 헤더와 로그로 남긴다.
// 브라우저 개발자도구 Network > Timing 탭에서도 같은 값이 보인다.
export class ServerTiming {
  private readonly start = performance.now();
  private readonly entries: [string, number][] = [];

  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const t = performance.now();
    try {
      return await fn();
    } finally {
      this.entries.push([name, performance.now() - t]);
    }
  }

  header(): string {
    const total = performance.now() - this.start;
    return [...this.entries, ["total", total] as [string, number]]
      .map(([name, dur]) => `${name};dur=${dur.toFixed(1)}`)
      .join(", ");
  }

  log(route: string): string {
    const header = this.header();
    console.info(`[timing] ${route} ${header}`);
    return header;
  }
}
