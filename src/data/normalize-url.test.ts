import { describe, expect, it } from 'vitest';
import { normalizeUrl } from './normalize-url';

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('example.com')).toEqual({ ok: true, url: 'https://example.com/', hostname: 'example.com' });
  });

  it('keeps an explicit http scheme and trims whitespace', () => {
    expect(normalizeUrl('  http://example.com/a?b=1 ')).toEqual({
      ok: true,
      url: 'http://example.com/a?b=1',
      hostname: 'example.com',
    });
  });

  it.each([
    ['', 'Enter a website address.'],
    ['ftp://example.com', 'Only http and https addresses work.'],
    ['localhost:3000', 'Use a public website, like example.com.'],
    ['http://intranet', 'Use a public website, like example.com.'],
    ['http://192.168.0.1', 'Use a website name, not an IP address.'],
    ['http://[::1]/', 'Use a public website, like example.com.'],
    ['http://exa mple.com', 'That does not look like a valid address.'],
    [`https://example.com/${'a'.repeat(2100)}`, 'That address is too long.'],
  ])('rejects %j', (input, message) => {
    expect(normalizeUrl(input)).toEqual({ ok: false, message });
  });
});
