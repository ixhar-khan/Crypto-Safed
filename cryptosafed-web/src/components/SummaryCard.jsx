export default function SummaryCard({ summaryEn, summaryUr, language }) {
  const showEn = language !== "ur";
  const showUr = language !== "en";

  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5 space-y-5">
      <h2 className="text-base font-semibold text-navy">
        Plain-language summary
      </h2>

      {showEn && (
        <div>
          <p className="text-xs font-medium text-navy/40 mb-1">English</p>
          <p className="text-sm leading-relaxed text-navy/80">{summaryEn}</p>
        </div>
      )}

      {showUr && (
        <div>
          <p className="text-xs font-medium text-navy/40 mb-1">اردو</p>
          <p
            dir="rtl"
            lang="ur"
            className="text-base leading-loose text-navy/80"
          >
            {summaryUr}
          </p>
        </div>
      )}
    </section>
  );
}