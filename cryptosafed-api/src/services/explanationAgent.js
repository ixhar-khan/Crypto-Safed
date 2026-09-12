import { callLlmChat } from "./llmClient.js";

const FALLBACK_SUMMARY_EN =
  "This project shows some risk. Review the details and relevant Pakistan regulations before investing.";
const FALLBACK_SUMMARY_UR =
  "اس منصوبے میں کچھ خطرہ ہے۔ سرمایہ کاری سے پہلے تفصیلات اور پاکستان کے متعلقہ قوانین کا جائزہ لیں۔";
const FALLBACK_DISCLAIMER =
  "Not financial advice. Crypto is high risk. Check SBP/SECP/FBR guidance for Pakistan.";

const SYSTEM_PROMPT = `You are a content writer for CryptoSafed, a Pakistan-focused tool that helps everyday users understand crypto project risk in plain language.

Rules:
- Write for a non-technical reader, avoid jargon.
- Be factual and grounded only in the inputs given, do not invent facts not present in them.
- Do not give personalized financial advice, only general risk awareness framing.
- Respond with valid JSON only, no markdown code fences, no commentary before or after.`;

function buildUserPrompt({
  risk_output,
  compliance_summary,
  research_highlights,
  include_social,
}) {
  const highlightsText =
    research_highlights.length > 0
      ? research_highlights.map((h) => `- ${h}`).join("\n")
      : "- No specific research highlights available.";

  const basePrompt = `Risk assessment:
- Risk score: ${risk_output.risk_score}/100
- Risk level: ${risk_output.risk_level}
- Key reasons: ${(risk_output.risk_reasons || []).join("; ")}

Compliance summary (Pakistan SBP/SECP/FBR context):
${compliance_summary}

Research highlights:
${highlightsText}

Write two summaries based on the above:
- summary_en: 3-5 sentences in plain English covering the risk level, the top 1-2 reasons, and one line referencing the compliance/regulatory angle.
- summary_ur: an accurate Urdu equivalent of summary_en, same meaning, natural Urdu phrasing, not a literal word-for-word translation.`;

  if (include_social) {
    return `${basePrompt}

Also generate a social_draft object for sharing this risk check on social media:
- seo_title: 60 characters or fewer, includes the project name (or "This Project" if no name is known) and something like "Scam or Legit?"
- meta_description: 150-160 characters, summarizing the risk check for search engines.
- post_text: 2-4 sentences suitable for X/Facebook/Instagram, mentioning the risk level and a call to do your own research.
- disclaimer: a standard crypto risk disclaimer mentioning it's not financial advice, crypto is high risk, and to check SBP/SECP/FBR guidance.

Respond with a single JSON object in exactly this shape:
{
  "summary_en": "...",
  "summary_ur": "...",
  "social_draft": {
    "seo_title": "...",
    "meta_description": "...",
    "post_text": "...",
    "disclaimer": "..."
  }
}`;
  }

  return `${basePrompt}

Respond with a single JSON object in exactly this shape:
{
  "summary_en": "...",
  "summary_ur": "..."
}`;
}

function parseJsonResponse(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  return JSON.parse(cleaned);
}

function defaultSocialDraft() {
  return {
    seo_title: "Crypto Project – Scam or Legit?",
    meta_description:
      "AI-powered risk check for this crypto project. See key red flags and Pakistan compliance notes before you invest.",
    post_text:
      "Thinking about this crypto project? Our AI risk check flagged some concerns. Do your own research before investing.",
    disclaimer: FALLBACK_DISCLAIMER,
  };
}

export async function generateExplanation({
  risk_output,
  compliance_summary,
  research_highlights,
  language,
  include_social,
}) {
  console.log(
    `[explanationAgent] language requested=${language}, include_social=${include_social}`,
  );

  try {
    const rawReply = await callLlmChat({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt({
        risk_output,
        compliance_summary,
        research_highlights,
        include_social,
      }),
    });

    const parsed = parseJsonResponse(rawReply);

    const summary_en =
      typeof parsed.summary_en === "string" && parsed.summary_en.trim()
        ? parsed.summary_en.trim()
        : FALLBACK_SUMMARY_EN;

    const summary_ur =
      typeof parsed.summary_ur === "string" && parsed.summary_ur.trim()
        ? parsed.summary_ur.trim()
        : FALLBACK_SUMMARY_UR;

    let social_draft = null;

    if (include_social) {
      const sd = parsed.social_draft;
      social_draft =
        sd && typeof sd === "object"
          ? {
              seo_title:
                typeof sd.seo_title === "string"
                  ? sd.seo_title.trim()
                  : defaultSocialDraft().seo_title,
              meta_description:
                typeof sd.meta_description === "string"
                  ? sd.meta_description.trim()
                  : defaultSocialDraft().meta_description,
              post_text:
                typeof sd.post_text === "string"
                  ? sd.post_text.trim()
                  : defaultSocialDraft().post_text,
              disclaimer:
                typeof sd.disclaimer === "string"
                  ? sd.disclaimer.trim()
                  : FALLBACK_DISCLAIMER,
            }
          : defaultSocialDraft();
    }

    console.log(`[explanationAgent] social draft generated=${include_social}`);

    return { summary_en, summary_ur, social_draft };
  } catch (err) {
    console.error(
      "[explanationAgent] LLM explanation failed, using fallback:",
      err.message,
    );

    const social_draft = include_social ? defaultSocialDraft() : null;

    console.log(
      `[explanationAgent] social draft generated=${include_social} (fallback path)`,
    );

    return {
      summary_en: FALLBACK_SUMMARY_EN,
      summary_ur: FALLBACK_SUMMARY_UR,
      social_draft,
    };
  }
}
