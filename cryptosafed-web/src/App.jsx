import { useState } from "react";
import { analyzeCryptoProject } from "./api";
import Logo from "./components/Logo";
import RiskOverviewPanel from "./components/RiskOverviewPanel";
import RiskReasonsCard from "./components/RiskReasonsCard";
import ComplianceCard from "./components/ComplianceCard";
import SummaryCard from "./components/SummaryCard";
import SocialDraftCard from "./components/SocialDraftCard";
import HowItWorks from "./components/HowItWorks";

const initialForm = {
  input_text: "",
  input_url: "",
  language: "en",
  include_social: false,
};

const HERO_BADGES = [
  "Regulatory analysis",
  "Risk assessment",
  "Evidence-based",
  "Pakistan-focused",
];

function CheckBadge({ label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-navy/70">
      <svg
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5 text-brand"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-4-4" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmedText = form.input_text.trim();
    const trimmedUrl = form.input_url.trim();

    if (!trimmedText && !trimmedUrl) {
      setError("Enter a project description or a URL before analyzing.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeCryptoProject({
        input_text: trimmedText || null,
        input_url: trimmedUrl || null,
        language: form.language,
        include_social: form.include_social,
      });
      setResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong while analyzing this project.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <header className="flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <h1 className="text-lg font-bold text-navy leading-tight">
              CryptoSafed
            </h1>
            <p className="text-xs text-navy/50 leading-tight">
              Regulatory Intelligence for Safer Crypto
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-2xl bg-gradient-to-br from-white to-brand/5 border border-line p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">
            AI-Powered Crypto Due Diligence
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
            Research Before You <span className="text-brand">Invest</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-navy/60">
            CryptoSafed analyzes crypto projects, tokens, and airdrops using AI
            agents and real Pakistani regulatory guidance, so you can make an
            informed decision in seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {HERO_BADGES.map((label) => (
              <CheckBadge key={label} label={label} />
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5">
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                  <SearchIcon />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-navy">
                    Analyze a crypto project
                  </h2>
                  <p className="text-xs text-navy/50">
                    Paste a description, an airdrop post, or a project URL.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <textarea
                    id="input_text"
                    rows={5}
                    maxLength={2000}
                    value={form.input_text}
                    onChange={(e) => updateField("input_text", e.target.value)}
                    placeholder="e.g. Paste an airdrop announcement, token page text, or describe the project..."
                    className="w-full rounded-xl border border-line bg-bg/60 px-4 py-3 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <div className="mt-1 text-right text-xs text-navy/35">
                    {form.input_text.length}/2000
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="input_url"
                    className="block text-xs font-medium text-navy/60 mb-1.5"
                  >
                    Or a project URL
                  </label>
                  <input
                    id="input_url"
                    type="url"
                    value={form.input_url}
                    onChange={(e) => updateField("input_url", e.target.value)}
                    placeholder="https://example.com/token-page"
                    className="w-full rounded-xl border border-line bg-bg/60 px-4 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="language"
                        className="text-xs font-medium text-navy/60"
                      >
                        Language
                      </label>
                      <select
                        id="language"
                        value={form.language}
                        onChange={(e) =>
                          updateField("language", e.target.value)
                        }
                        className="rounded-lg border border-line bg-bg/60 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      >
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-navy/60">
                      Include social draft
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.include_social}
                        onClick={() =>
                          updateField("include_social", !form.include_social)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                          form.include_social ? "bg-brand" : "bg-line"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            form.include_social
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Analyzing…" : "Analyze"}
                  </button>
                </div>
              </form>
            </section>

            {error && (
              <div className="rounded-xl border border-risk-critical/30 bg-risk-critical/5 px-4 py-3 text-sm text-risk-critical">
                {error}
              </div>
            )}

            {result && (
              <>
                <RiskReasonsCard
                  level={result.risk_level}
                  reasons={result.risk_reasons}
                />
                <SummaryCard
                  summaryEn={result.summary_en}
                  summaryUr={result.summary_ur}
                  language={form.language}
                />
                {form.include_social && result.social_draft && (
                  <SocialDraftCard socialDraft={result.social_draft} />
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <RiskOverviewPanel result={result} />
            <ComplianceCard summary={result?.compliance_summary} />
            <HowItWorks />
          </div>
        </div>
      </div>
    </div>
  );
}
