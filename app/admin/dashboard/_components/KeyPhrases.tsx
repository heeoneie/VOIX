interface Props {
  positive: string[];
  negative: string[];
}

export default function KeyPhrases({ positive, negative }: Props) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          긍정 표현
        </h4>
        <div className="flex flex-col gap-2">
          {positive.map((phrase, i) => (
            <div
              key={i}
              className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800"
            >
              &ldquo;{phrase}&rdquo;
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          개선 요청
        </h4>
        <div className="flex flex-col gap-2">
          {negative.map((phrase, i) => (
            <div
              key={i}
              className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-xs leading-relaxed text-rose-800"
            >
              &ldquo;{phrase}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
