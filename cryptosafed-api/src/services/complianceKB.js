import { readdir, readFile } from "fs/promises";
import path from "path";

const COMPLIANCE_DIR = path.resolve(process.cwd(), "data/compliance");
const CHUNK_SIZE = 450;
const CHUNK_OVERLAP = 60;

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "of",
  "to",
  "in",
  "on",
  "for",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "by",
  "with",
  "as",
  "at",
  "from",
  "that",
  "this",
  "it",
  "its",
  "their",
  "not",
  "no",
  "any",
  "may",
  "can",
  "will",
  "has",
  "have",
  "had",
  "if",
  "than",
  "then",
  "such",
  "other",
  "more",
  "most",
  "also",
  "so",
  "which",
  "who",
  "whom",
  "these",
  "those",
]);

let index = [];
let idf = new Map();
let ready = false;

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t),
  );
}

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 0);
}

function buildTfIdf(chunks) {
  const docFreq = new Map();

  const tokenizedChunks = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const seen = new Set(tokens);
    for (const t of seen) {
      docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }
    return { ...chunk, tokens };
  });

  const N = tokenizedChunks.length;
  const idfMap = new Map();
  for (const [token, df] of docFreq.entries()) {
    idfMap.set(token, Math.log((N + 1) / (df + 1)) + 1);
  }

  const vectors = tokenizedChunks.map(({ tokens, ...chunk }) => {
    const tf = new Map();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    const vector = new Map();
    let normSq = 0;
    for (const [token, freq] of tf.entries()) {
      const weight = freq * (idfMap.get(token) || 0);
      vector.set(token, weight);
      normSq += weight * weight;
    }
    return { ...chunk, vector, norm: Math.sqrt(normSq) || 1 };
  });

  return { vectors, idfMap };
}

export async function initComplianceKB() {
  try {
    const files = (await readdir(COMPLIANCE_DIR)).filter((f) =>
      f.endsWith(".txt"),
    );

    if (files.length === 0) {
      console.warn(
        `[complianceKB] No .txt files found in ${COMPLIANCE_DIR}. Compliance summaries will use fallback text.`,
      );
      index = [];
      ready = false;
      return;
    }

    const rawChunks = [];
    let chunkId = 0;

    for (const file of files) {
      const filePath = path.join(COMPLIANCE_DIR, file);
      const content = await readFile(filePath, "utf-8");
      const title = file.replace(/\.txt$/, "").replace(/_/g, " ");
      const pieces = chunkText(content);

      for (const text of pieces) {
        rawChunks.push({ id: chunkId++, text, source: file, title });
      }
    }

    const { vectors, idfMap } = buildTfIdf(rawChunks);
    index = vectors;
    idf = idfMap;
    ready = true;

    console.log(
      `[complianceKB] Loaded ${files.length} file(s), indexed ${index.length} chunk(s).`,
    );
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(
        `[complianceKB] Compliance directory not found at ${COMPLIANCE_DIR}. Create it and add .txt files; compliance summaries will use a fallback until then.`,
      );
    } else {
      console.error(
        "[complianceKB] Failed to initialize compliance knowledge base:",
        err.message,
      );
    }
    index = [];
    ready = false;
  }
}

export async function searchCompliance(query, topK = 3) {
  if (!ready || index.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const queryTf = new Map();
  for (const t of queryTokens) {
    queryTf.set(t, (queryTf.get(t) || 0) + 1);
  }

  const queryVector = new Map();
  let queryNormSq = 0;
  for (const [token, freq] of queryTf.entries()) {
    const weight = freq * (idf.get(token) || 0);
    queryVector.set(token, weight);
    queryNormSq += weight * weight;
  }
  const queryNorm = Math.sqrt(queryNormSq) || 1;

  const scored = index.map((chunk) => {
    let dot = 0;
    for (const [token, weight] of queryVector.entries()) {
      if (chunk.vector.has(token)) {
        dot += weight * chunk.vector.get(token);
      }
    }
    const score = dot / (queryNorm * chunk.norm);
    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ text, source, title, score }) => ({ text, source, title, score }));
}
