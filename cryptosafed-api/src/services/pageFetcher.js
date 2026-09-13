import * as cheerio from 'cheerio';

const MAX_CHARS = 9000;
const MIN_MEANINGFUL_CHARS = 200;
const USER_AGENT = 'Mozilla/5.0 (compatible; CryptoSafedBot/1.0)';

export async function fetchPageText(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow'
    });
  } catch (networkErr) {
    throw new Error(`Failed to fetch URL: ${networkErr.message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $('script, style, nav, footer, header, noscript, svg, iframe, aside, [role="navigation"]').remove();

  const contentSelectors = ['main', 'article', '[role="main"]', '#content', '.content'];
  let text = '';

  for (const selector of contentSelectors) {
    const candidate = $(selector).text().replace(/\s+/g, ' ').trim();
    if (candidate.length > text.length) {
      text = candidate;
    }
  }

  if (text.length < MIN_MEANINGFUL_CHARS) {
    text = $('body').text().replace(/\s+/g, ' ').trim();
  }

  if (text.length < MIN_MEANINGFUL_CHARS) {
    throw new Error(
      'Could not extract meaningful content from this URL. The page may rely on JavaScript to load its content, or be blocking automated requests. Try pasting the project description as text instead.'
    );
  }

  return text.slice(0, MAX_CHARS);
}