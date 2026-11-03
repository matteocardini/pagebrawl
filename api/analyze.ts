// Vercel serverless function: PageSpeed Insights proxy. One URL per call.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ERROR_STATUS, extractMetrics, parseTargetUrl } from './_psi.js';
import type { ErrorCode } from './_psi.js';

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
// Below the 60 s function limit so we can answer with a proper `timeout` error.
const PSI_TIMEOUT_MS = 55_000;

const MESSAGES: Record<ErrorCode, string> = {
  invalid_url: 'The url parameter must be a public http or https address.',
  rate_limited: 'PageSpeed Insights is rate limiting requests. Try again in a minute.',
  analysis_failed: 'PageSpeed Insights could not analyze this page.',
  timeout: 'The analysis took too long.',
  server_error: 'Something went wrong on the server.',
};

function fail(res: VercelResponse, code: ErrorCode) {
  return res.status(ERROR_STATUS[code]).json({ error: code, message: MESSAGES[code] });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const target = parseTargetUrl(Array.isArray(req.query.url) ? req.query.url[0] : req.query.url);
  if (!target) return fail(res, 'invalid_url');

  const key = process.env.PSI_API_KEY;
  if (!key) return fail(res, 'server_error');

  const params = new URLSearchParams({
    url: target.href,
    strategy: 'mobile',
    category: 'performance',
    key,
  });

  try {
    const response = await fetch(`${PSI_ENDPOINT}?${params}`, { signal: AbortSignal.timeout(PSI_TIMEOUT_MS) });
    if (response.status === 429) return fail(res, 'rate_limited');
    // 401/403 mean our key is wrong or disabled: that is our problem, not the user's.
    if (response.status === 401 || response.status === 403) return fail(res, 'server_error');
    if (!response.ok) return fail(res, 'analysis_failed');

    const metrics = extractMetrics(await response.json());
    if (!metrics) return fail(res, 'analysis_failed');

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      url: target.href,
      hostname: target.hostname,
      metrics,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Never log the request URL or the key; the error name is enough.
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    return fail(res, timedOut ? 'timeout' : 'server_error');
  }
}
