import * as cheerio from "cheerio";

const MAX_CHARS = 9000;
const USER_AGENT = "Mozilla/5.0 (compatible; CryptoSafedBot/1.0)";

export async function fetchPageText(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
  } catch (networkErr) {
    throw new Error(`Failed to fetch URL: ${networkErr.message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, noscript, svg, iframe").remove();

  const text = $("body").text().replace(/\s+/g, " ").trim();

  return text.slice(0, MAX_CHARS);
}
