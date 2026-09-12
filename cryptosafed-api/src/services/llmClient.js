import config from '../config/index.js';

const CHAT_COMPLETIONS_PATH = '/chat/completions';

const MOCK_RESPONSE_JSON = JSON.stringify({
  extracted_fields: {
    project_name: 'Mock Project',
    token_name: 'MockToken',
    token_symbol: 'MOCK',
    promised_apy: '500% (mocked)',
    team_info: 'Anonymous (mock data, no real API call made)',
    audit_info: 'none (mock)',
    token_distribution: 'not mentioned (mock)',
    guarantee_language: '"guaranteed returns" (mock)'
  },
  search_queries: ['Mock Project scam', 'MockToken audit', 'Mock Project review']
});

export async function callLlmChat({ system, user, model = config.groqModel }) {
  if (config.mockLlm) {
    console.log('[llmClient] MOCK_LLM=true, skipping real API call');
    return MOCK_RESPONSE_JSON;
  }

  if (!config.groqApiKey) {
    throw new Error('GROQ_API_KEY is not set. Add it to your .env file.');
  }

  const url = `${config.groqBaseUrl}${CHAT_COMPLETIONS_PATH}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.groqApiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.2
      })
    });
  } catch (networkErr) {
    throw new Error(`Groq API network error: ${networkErr.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq API returned an empty response.');
  }

  return content;
}
