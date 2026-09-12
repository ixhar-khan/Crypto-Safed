import { runResearch } from "../services/researchAgent.js";
import { assessRisk } from "../services/riskAgent.js";
import { generateComplianceSummary } from "../services/complianceAgent.js";
import { generateExplanation } from "../services/explanationAgent.js";

const VALID_LANGUAGES = ["en", "ur", "both"];

function validateAnalyzeRequest(body) {
  const errors = [];
  const { input_text, input_url, language, include_social } = body;

  const hasText =
    typeof input_text === "string" && input_text.trim().length > 0;
  const hasUrl = typeof input_url === "string" && input_url.trim().length > 0;

  if (!hasText && !hasUrl) {
    errors.push(
      "Either input_text or input_url must be provided and non-empty.",
    );
  }

  if (!VALID_LANGUAGES.includes(language)) {
    errors.push(`language must be one of: ${VALID_LANGUAGES.join(", ")}.`);
  }

  if (typeof include_social !== "boolean") {
    errors.push("include_social must be a boolean.");
  }

  return errors;
}

function buildResearchHighlights(extracted_fields = {}) {
  const highlights = [];
  const {
    project_name,
    promised_apy,
    team_info,
    audit_info,
    guarantee_language,
    token_distribution,
  } = extracted_fields;

  if (project_name && project_name !== "not mentioned") {
    highlights.push(`Project: ${project_name}`);
  }
  if (promised_apy && promised_apy !== "not mentioned") {
    highlights.push(`Promised return: ${promised_apy}`);
  }
  if (team_info && team_info !== "not mentioned") {
    highlights.push(`Team: ${team_info}`);
  }
  if (audit_info && audit_info !== "not mentioned" && audit_info !== "none") {
    highlights.push(`Audit: ${audit_info}`);
  }
  if (
    guarantee_language &&
    guarantee_language !== "none" &&
    guarantee_language !== "not mentioned"
  ) {
    highlights.push(`Guarantee language used: ${guarantee_language}`);
  }
  if (token_distribution && token_distribution !== "not mentioned") {
    highlights.push(`Tokenomics: ${token_distribution}`);
  }

  return highlights.slice(0, 4);
}

export async function analyzeHandler(req, res) {
  try {
    const errors = validateAnalyzeRequest(req.body || {});

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.join(" "),
      });
    }

    const { input_text, input_url, language, include_social } = req.body;

    let research_report;
    try {
      research_report = await runResearch({ input_text, input_url });
    } catch (researchErr) {
      console.error(
        "[analyzeController] research failed:",
        researchErr.message,
      );
      return res.status(500).json({
        error: "Research failed",
        details: researchErr.message,
      });
    }

    const riskAssessment = await assessRisk({ research_report });

    const project_context = {
      project_name: research_report?.extracted_fields?.project_name,
      token_name: research_report?.extracted_fields?.token_name,
      description: research_report?.raw_snippets?.slice(0, 200),
    };

    const compliance_summary = await generateComplianceSummary({
      project_context,
    });

    const research_highlights = buildResearchHighlights(
      research_report?.extracted_fields,
    );

    const explanation = await generateExplanation({
      risk_output: riskAssessment,
      compliance_summary,
      research_highlights,
      language,
      include_social,
    });

    const responseBody = {
      risk_score: riskAssessment.risk_score,
      risk_level: riskAssessment.risk_level,
      risk_reasons: riskAssessment.risk_reasons,
      compliance_summary,
      summary_en: explanation.summary_en,
      summary_ur: explanation.summary_ur,
      social_draft: explanation.social_draft,
      research_report,
    };

    return res.status(200).json(responseBody);
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
