const STEPS = [
  {
    name: "Research Agent",
    desc: "Extracts project facts from text or a URL.",
    tint: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Risk Agent",
    desc: "Scores risk with a rubric refined by Groq.",
    tint: "bg-amber-50 text-amber-600",
  },
  {
    name: "Compliance Agent",
    desc: "Grounds guidance in SBP/SECP/FBR docs.",
    tint: "bg-sky-50 text-sky-600",
  },
  {
    name: "Explanation Agent",
    desc: "Writes bilingual, plain-language summaries.",
    tint: "bg-violet-50 text-violet-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5">
      <h2 className="text-base font-semibold text-navy mb-4">
        How CryptoSafed works
      </h2>
      <ul className="space-y-3">
        {STEPS.map((step) => (
          <li key={step.name} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${step.tint}`}
            >
              {step.name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-medium text-navy">{step.name}</p>
              <p className="text-xs text-navy/50">{step.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
