interface Keyword {
  word: string;
  frequency: number;
}

interface Props {
  keywords: Keyword[];
}

export default function KeywordCloud({ keywords }: Props) {
  const maxFreq = Math.max(...keywords.map((k) => k.frequency));

  const getStyle = (freq: number) => {
    const ratio = freq / maxFreq;
    if (ratio > 0.75)
      return "text-base font-bold text-blue-700 bg-blue-100 border-blue-200";
    if (ratio > 0.5)
      return "text-sm font-semibold text-blue-600 bg-blue-50 border-blue-100";
    if (ratio > 0.25)
      return "text-sm font-medium text-slate-600 bg-slate-100 border-slate-200";
    return "text-xs text-slate-500 bg-slate-50 border-slate-100";
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {keywords.map((kw, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 transition hover:shadow-sm ${getStyle(kw.frequency)}`}
        >
          {kw.word}
          <span className="text-[10px] font-normal opacity-60">
            {kw.frequency}
          </span>
        </span>
      ))}
    </div>
  );
}
