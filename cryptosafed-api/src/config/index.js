import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  mockLlm: process.env.MOCK_LLM === "true",
};

export default config;
