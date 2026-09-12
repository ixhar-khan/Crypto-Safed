import { callLlmChat } from "./llmClient.js";
import { riskRubric, riskLevels } from "../config/riskRubric.js";

const SYSTEM_PROMPT = `You are a crypto risk analyst for CryptoSafed, a Pakistan-focused tool that scores how risky a crypto project or airdrop is for everyday users.

You will be given:
- A rule-based base risk score (0-100) already computed from a fixed rubric.
- The rubric itself (which factors matter and their weights).
- Extracted facts about the project.
- Search findings (may be placeholder text if real search hasn't run yet).

Your job: refine the score using judgment, and give clear, specific reasons a non-technical user can understand.

Rules:
- refined_score must be an integer from 0 to 100.
- Do not swing wildly away from the base score without justification in your reasons; small, reasoned adjustments are expected, not a totally different number.
- risk_reasons must be 3-6 short, plain-language bullet points, each grounded in the actual extracted facts, not generic disclaimers.
- Respond with valid JSON only, no markdown code fences, no commentary before or after.`;

function triggersAnonTeam(fields) {
  const info = (fields.team_info || "").toLowerCase();
  if (!info || info === "not mentioned") return false;
  return /anonymous|unverified|unverifiable|no name|unknown team|undisclosed/.test(
    info,
  );
}

function triggersNoAudit(fields) {
  const info = (fields.audit_info || "").toLowerCase();
  return (
    !info ||
    info === "not mentioned" ||
    info === "none" ||
    /no audit|unaudited|unknown auditor/.test(info)
  );
}

function triggersHighApy(fields) {
  const apy = (fields.promised_apy || "").toLowerCase();
  if (!apy || apy === "not mentioned") return false;
  const match = apy.match(/(\d+(\.\d+)?)\s*%/);
  if (match) {
    return parseFloat(match[1]) >= 50;
  }
  return /guaranteed|unlimited|fixed high/.test(apy);
}

function triggersGuaranteeLanguage(fields) {
  const lang = (fields.guarantee_language || "").toLowerCase();
  return !(!lang || lang === "none" || lang === "not mentioned");
}

function triggersNegativeSearch(findings) {
  const text = (findings || []).join(" ").toLowerCase();
  return /scam|fraud|rug pull|rugpull|ponzi|warning|blacklist/.test(text);
}

function triggersOpaqueTokenomics(fields) {
  const dist = (fields.token_distribution || "").toLowerCase();
  if (!dist || dist === "not mentioned") return true;
  return /centralized|majority held by team|no vesting/.test(dist);
}

function computeBaseScore(extracted_fields, search_findings) {
  const triggers = {
    anon_team: triggersAnonTeam(extracted_fields),
    no_audit: triggersNoAudit(extracted_fields),
    high_apy: triggersHighApy(extracted_fields),
    guarantee_language: triggersGuaranteeLanguage(extracted_fields),
    negative_search: triggersNegativeSearch(search_findings),
    opaque_tokenomics: triggersOpaqueTokenomics(extracted_fields),
  };

  let score = 0;
  const triggeredReasons = [];

  for (const [key, triggered] of Object.entries(triggers)) {
    if (triggered) {
      score += riskRubric[key].weight;
      triggeredReasons.push(riskRubric[key].description);
    }
  }

  return { base_score: Math.min(score, 100), triggeredReasons };
}

function getRiskLevel(score) {
  for (const level of Object.values(riskLevels)) {
    if (score >= level.min && score <= level.max) {
      return level.label;
    }
  }
  return riskLevels.critical.label;
}

function buildUserPrompt({ base_score, extracted_fields, search_findings }) {
  const rubricSummary = Object.entries(riskRubric)
    .map(([key, val]) => `- ${key} (weight ${val.weight}): ${val.description}`)
    .join("\n");

  return `Rubric:
${rubricSummary}

Base rule-based score: ${base_score}/100

Extracted project fields:
${JSON.stringify(extracted_fields, null, 2)}

Search findings:
${JSON.stringify(search_findings, null, 2)}

Respond with a single JSON object in exactly this shape:
{
  "refined_score": 0,
  "risk_reasons": ["reason1", "reason2", "reason3"]
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

export async function assessRisk({ research_report }) {
  const extracted_fields = research_report?.extracted_fields || {};
  const search_findings = research_report?.search_findings || [];

  const { base_score, triggeredReasons } = computeBaseScore(
    extracted_fields,
    search_findings,
  );
  console.log(`[riskAgent] base_score=${base_score}`);

  try {
    const rawReply = await callLlmChat({
      system: SYSTEM_PROMPT,
      user: buildUserPrompt({ base_score, extracted_fields, search_findings }),
    });

    const parsed = parseJsonResponse(rawReply);

    const refinedScoreRaw = Number(parsed.refined_score);
    const risk_score = Number.isFinite(refinedScoreRaw)
      ? Math.max(0, Math.min(100, Math.round(refinedScoreRaw)))
      : base_score;

    const risk_reasons =
      Array.isArray(parsed.risk_reasons) && parsed.risk_reasons.length > 0
        ? parsed.risk_reasons
        : triggeredReasons;

    console.log("[riskAgent] LLM refinement received");

    return {
      risk_score,
      risk_level: getRiskLevel(risk_score),
      risk_reasons,
    };
  } catch (err) {
    console.error(
      "[riskAgent] LLM refinement failed, falling back to rule-based score:",
      err.message,
    );

    return {
      risk_score: base_score,
      risk_level: getRiskLevel(base_score),
      risk_reasons:
        triggeredReasons.length > 0
          ? triggeredReasons
          : ["No significant risk factors detected by rule-based checks."],
    };
  }
}
