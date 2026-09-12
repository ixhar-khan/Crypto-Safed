const LEVEL_TEXT = {
  Low: "text-risk-low",
  Medium: "text-risk-medium",
  High: "text-risk-high",
  Critical: "text-risk-critical",
};

const LEVEL_BG = {
  Low: "bg-risk-low",
  Medium: "bg-risk-medium",
  High: "bg-risk-high",
  Critical: "bg-risk-critical",
};

const LEVEL_SOFT_BG = {
  Low: "bg-risk-low/10",
  Medium: "bg-risk-medium/10",
  High: "bg-risk-high/10",
  Critical: "bg-risk-critical/10",
};

const LEVEL_NOTE = {
  Low: "Few or no concerns found.",
  Medium: "Some concerns found. Review before proceeding.",
  High: "Significant concerns found. Proceed with caution.",
  Critical: "Serious red flags found. Strongly reconsider.",
};

const LEGEND = [
  { key: "Low", label: "Low Risk", range: "0 – 25" },
  { key: "Medium", label: "Medium Risk", range: "26 – 50" },
  { key: "High", label: "High Risk", range: "51 – 75" },
  { key: "Critical", label: "Critical Risk", range: "76 – 100" },
];

function Gauge({ score, level }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const dash = (clamped / 100) * circumference;
  const strokeClass = LEVEL_TEXT[level] || "text-navy/30";

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E7F1EC"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke="currentColor"
          className={strokeClass}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-navy">{score ?? "–"}</span>
        <span className="text-[11px] text-navy/40">/100</span>
      </div>
    </div>
  );
}

export default function RiskOverviewPanel({ result }) {
  const level = result?.risk_level;

  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5">
      <h2 className="text-base font-semibold text-navy mb-4">
        Risk score overview
      </h2>

      {result ? (
        <div className="flex items-center gap-4 mb-5">
          <Gauge score={result.risk_score} level={level} />
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${LEVEL_SOFT_BG[level] || "bg-navy/10"} ${LEVEL_TEXT[level] || "text-navy"}`}
            >
              {level} Risk
            </span>
            <p className="mt-2 text-xs text-navy/50 max-w-[10rem]">
              {LEVEL_NOTE[level] || ""}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-navy/50 mb-5">
          Run an analysis to see the risk score here.
        </p>
      )}

      <div className="space-y-2 border-t border-line pt-4">
        {LEGEND.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-navy/70">
              <span
                className={`h-2.5 w-2.5 rounded-full ${LEVEL_BG[item.key]}`}
              />
              {item.label}
            </span>
            <span className="text-navy/40 text-xs">{item.range}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
