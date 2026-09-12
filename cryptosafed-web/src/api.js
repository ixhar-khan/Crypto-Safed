const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function analyzeCryptoProject({
  input_text,
  input_url,
  language,
  include_social,
}) {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Check your .env file.");
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_text, input_url, language, include_social }),
    });
  } catch (networkErr) {
    throw new Error(
        `Could not reach the CryptoSafed server at ${BASE_URL}. Is it running?`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
        throw new Error("Server returned an unexpected response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.details ||
        data?.error ||
        `Request failed with status ${response.status}.`,
    );
  }

  return data;
}
