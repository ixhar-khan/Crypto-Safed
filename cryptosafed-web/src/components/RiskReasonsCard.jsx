const LEVEL_BG = {
  Low: "bg-risk-low",
  Medium: "bg-risk-medium",
  High: "bg-risk-high",
  Critical: "bg-risk-critical",
};

export default function RiskReasonsCard({ level, reasons }) {
  if (!reasons || reasons.length === 0) return null;
  const dotClass = LEVEL_BG[level] || "bg-navy";

  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5">
      <h2 className="text-base font-semibold text-navy mb-4">
        Key risk factors
      </h2>
      <ul className="space-y-3">
        {reasons.map((reason, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-navy/80"
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`}
            />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
