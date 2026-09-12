import { fetchPageText } from "./pageFetcher.js";
import { callLlmChat } from "./llmClient.js";

const SYSTEM_PROMPT = `You are a crypto research assistant for CryptoSafed, a Pakistan-focused tool that helps users spot risky crypto projects and airdrops. You read raw text scraped from crypto project pages, whitepapers, or social posts, and extract structured facts precisely and conservatively.

Rules:
- Do not guess or invent values. If a field is not mentioned in the content, use "not mentioned" (for text fields) or [] (for lists).
- Do not give investment advice or opinions. Extraction only.
- Respond with valid JSON only, no markdown code fences, no commentary before or after.`;

function buildUserPrompt(content) {
  return `Extract structured information from the following crypto project content, and suggest 2-3 external verification search queries.

Content:
"""
${content}
"""

Respond with a single JSON object in exactly this shape:
{
  "extracted_fields": {
    "project_name": "string or 'not mentioned'",
    "token_name": "string or 'not mentioned'",
    "token_symbol": "string or 'not mentioned'",
    "promised_apy": "string or 'not mentioned'",
    "team_info": "string describing named vs anonymous team, with any links mentioned",
    "audit_info": "string naming the auditor and report link, or 'none'",
    "token_distribution": "string describing team %, public %, vesting if mentioned",
    "guarantee_language": "string quoting any 'guaranteed returns' / 'no risk' style language, or 'none'"
  },
  "search_queries": ["query1", "query2", "query3"]
}`;
}

function parseLlmJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`LLM did not return valid JSON: ${err.message}`);
  }
}

function buildDummySearchFindings(queries) {
  return queries.map(
    (q, i) =>
      `Dummy finding for query ${i + 1} ("${q}"): no real web search performed yet, placeholder result.`,
  );
}

export async function runResearch({ input_text, input_url }) {
  console.log("[researchAgent] starting research", {
    hasText: !!input_text,
    hasUrl: !!input_url,
  });

  let combinedContent = input_text ? input_text.trim() : "";

  if (input_url) {
    const pageText = await fetchPageText(input_url);
    console.log(
      `[researchAgent] page fetch complete, length=${pageText.length}`,
    );
    combinedContent = [combinedContent, pageText].filter(Boolean).join("\n\n");
  }

  if (!combinedContent) {
    throw new Error("No content available to research after fetching input.");
  }

  const truncatedContent = combinedContent.slice(0, 9000);

  const rawReply = await callLlmChat({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(truncatedContent),
  });

  console.log("[researchAgent] LLM response received");

  const parsed = parseLlmJson(rawReply);

  const extracted_fields = parsed.extracted_fields || {};
  const search_queries = Array.isArray(parsed.search_queries)
    ? parsed.search_queries.slice(0, 3)
    : [];
  const search_findings = buildDummySearchFindings(search_queries);

  return {
    extracted_fields,
    search_queries,
    search_findings,
    raw_snippets: truncatedContent.slice(0, 500),
  };
}
