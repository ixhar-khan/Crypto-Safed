import { searchCompliance } from "./complianceKB.js";
import { callLlmChat } from "./llmClient.js";

const FALLBACK_SUMMARY =
  "Regulatory guidance in Pakistan on crypto assets is evolving. Users should check latest SBP/SECP/FBR notices and consult a tax professional.";

const SYSTEM_PROMPT =
  "You are a Pakistan crypto compliance assistant. Summarize relevant SBP/SECP/FBR guidance for an individual user in plain language. Base your summary only on the provided source excerpts, do not invent regulations or specific figures not present in the sources.";

function buildProjectContextLine(project_context) {
  if (!project_context) return "No specific project details provided.";
  const { project_name, token_name, description } = project_context;
  const parts = [];
  if (project_name && project_name !== "not mentioned")
    parts.push(`Project: ${project_name}`);
  if (token_name && token_name !== "not mentioned")
    parts.push(`Token: ${token_name}`);
  if (description) parts.push(`Context: ${description}`);
  return parts.length > 0
    ? parts.join(". ")
    : "No specific project details provided.";
}

export async function generateComplianceSummary({ project_context }) {
  const queries = [
    "Pakistan SBP crypto advisory",
    "SECP virtual assets warning",
    "FBR tax on cryptocurrency Pakistan",
  ];

  let retrievedChunks = [];
  try {
    const results = await Promise.all(
      queries.map((q) => searchCompliance(q, 3)),
    );
    const seen = new Set();
    for (const chunkList of results) {
      for (const chunk of chunkList) {
        const key = `${chunk.source}:${chunk.text.slice(0, 40)}`;
        if (!seen.has(key)) {
          seen.add(key);
          retrievedChunks.push(chunk);
        }
      }
    }
  } catch (err) {
    console.error("[complianceAgent] Compliance search failed:", err.message);
    retrievedChunks = [];
  }

  console.log(
    `[complianceAgent] Retrieved ${retrievedChunks.length} chunk(s) for compliance summary.`,
  );

  let summary;

  if (retrievedChunks.length === 0) {
    summary = FALLBACK_SUMMARY;
  } else {
    const sourcesText = retrievedChunks
      .map((c, i) => `Source ${i + 1} (${c.title}):\n${c.text}`)
      .join("\n\n");

    const userPrompt = `${buildProjectContextLine(project_context)}

Relevant Pakistan regulatory excerpts:

${sourcesText}

Write a concise 5-8 sentence compliance summary in plain English for a Pakistani crypto user considering this project, grounded only in the excerpts above.`;

    try {
      const raw = await callLlmChat({
        system: SYSTEM_PROMPT,
        user: userPrompt,
      });
      summary = raw.trim() || FALLBACK_SUMMARY;
    } catch (err) {
      console.error(
        "[complianceAgent] LLM compliance summary failed, using fallback:",
        err.message,
      );
      summary = FALLBACK_SUMMARY;
    }
  }

  console.log(
    `[complianceAgent] Final compliance summary length: ${summary.length} chars.`,
  );

  return summary;
}
