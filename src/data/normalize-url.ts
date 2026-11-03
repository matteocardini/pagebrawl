export type NormalizedUrl = { ok: true; url: string; hostname: string } | { ok: false; message: string };

const MAX_URL_LENGTH = 2048;

function isIpLiteral(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[');
}

/** Client-side normalisation: adds https:// when the scheme is missing and validates the result. */
export function normalizeUrl(input: string): NormalizedUrl {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, message: 'Enter a website address.' };
  if (trimmed.length > MAX_URL_LENGTH) return { ok: false, message: 'That address is too long.' };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, message: 'That does not look like a valid address.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, message: 'Only http and https addresses work.' };
  }
  const hostname = parsed.hostname;
  if (!hostname.includes('.') || hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return { ok: false, message: 'Use a public website, like example.com.' };
  }
  if (isIpLiteral(hostname)) {
    return { ok: false, message: 'Use a website name, not an IP address.' };
  }
  return { ok: true, url: parsed.href, hostname };
}
