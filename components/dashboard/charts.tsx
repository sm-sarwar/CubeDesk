import { formatTaka } from "@/lib/customers";
import type { Slice } from "@/lib/dashboard";


function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s >= n) ?? 10;
  return step * p;
}

const compact = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(Math.round(n)));

export function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: Slice[];
  centerValue: string;
  centerLabel: string;
}) {
  const r = 60;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="22" className="stroke-muted" />
        {total > 0 &&
          data.map((d) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="22"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              >
                <title>{`${d.label}: ${formatTaka(d.value)}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold leading-tight">{centerValue}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

export function GroupedBars({
  data,
  aLabel,
  bLabel,
  aColor,
  bColor,
}: {
  data: { label: string; a: number; b: number }[];
  aLabel: string;
  bLabel: string;
  aColor: string;
  bColor: string;
}) {
  const W = 600, H = 250, L = 46, R = 8, T = 12, B = 30;
  const pw = W - L - R;
  const ph = H - T - B;
  const max = niceMax(Math.max(0, ...data.flatMap((d) => [d.a, d.b])));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const slot = pw / data.length;
  const bw = Math.min(slot * 0.28, 30);
  const y = (v: number) => T + ph - (v / max) * ph;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: aColor }} />
          {aLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: bColor }} />
          {bLabel}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" className="fill-muted-foreground">
              {compact(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = L + slot * i + slot / 2;
          return (
            <g key={i}>
              <rect
                x={cx - bw - 2}
                y={y(d.a)}
                width={bw}
                height={Math.max(T + ph - y(d.a), 0)}
                rx="4"
                fill={aColor}
              >
                <title>{`${d.label} · ${aLabel}: ${formatTaka(d.a)}`}</title>
              </rect>
              <rect
                x={cx + 2}
                y={y(d.b)}
                width={bw}
                height={Math.max(T + ph - y(d.b), 0)}
                rx="4"
                fill={bColor}
              >
                <title>{`${d.label} · ${bLabel}: ${formatTaka(d.b)}`}</title>
              </rect>
              <text x={cx} y={H - 9} textAnchor="middle" fontSize="12" className="fill-muted-foreground">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}