import { GOOGLE_SEARCH_HTML } from '../src/data/googleSearchPage';

/**
 * Clean and prepare HTML for the Object Spy iframe:
 * 1. Remove CSP, X-Frame-Options, and meta refresh
 * 2. Convert relative links (href, src, action) to absolute URLs
 * 3. Neutralize executable scripts (<script type="text/disabled">) so they cannot crash hydration,
 *    wipe document.body, execute frame busters, or blank the screen
 * 4. Strip inline event attributes (onload, onunload, onerror)
 * 5. Inject anti-blank screen guard CSS to guarantee elements remain visible
 */
function prepareHtmlForObjectSpy(rawHtml: string, finalOrigin: string): string {
  let modifiedHtml = rawHtml;

  // Remove restrictive headers, frame-busters, and auto-refresh
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
  modifiedHtml = modifiedHtml.replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, '');
  modifiedHtml = modifiedHtml.replace(/<base\s+[^>]*>/gi, '');

  // Resolve relative asset links to absolute URLs
  modifiedHtml = modifiedHtml.replace(
    /(href|src|action)=["']\/(?!\/)([^"']*)["']/gi,
    `$1="${finalOrigin}/$2"`
  );

  // Neutralize executable scripts so third-party React/hydration/anti-bot scripts do not wipe the DOM
  modifiedHtml = modifiedHtml.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, content) => {
    if (/type=["']application\/(ld\+)?json["']/i.test(attrs)) {
      return match;
    }
    return `<script type="text/disabled" data-spy-neutralized="true"${attrs}>/* Neutralized for QA Object Spy */</script>`;
  });

  // Neutralize inline lifecycle handlers
  modifiedHtml = modifiedHtml.replace(/\s+on(load|unload|beforeunload|error)=["'][^"']*["']/gi, ' data-disabled-event="true"');

  const baseTag = `<base href="${finalOrigin}/">`;
  const antiBlankGuardStyle = `
  <style id="spywright-anti-blank-guard">
    html, body {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-height: 100vh !important;
    }
    .async-hide {
      opacity: 1 !important;
    }
  </style>`;

  if (/<head[^>]*>/i.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}\n${antiBlankGuardStyle}`);
  } else if (/<html[^>]*>/i.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(/(<html[^>]*>)/i, `$1\n<head>${baseTag}\n${antiBlankGuardStyle}</head>`);
  } else {
    modifiedHtml = `<head>${baseTag}\n${antiBlankGuardStyle}</head>` + modifiedHtml;
  }

  return modifiedHtml;
}

/**
 * Resilient multi-strategy fetch engine:
 * Tries Safari WebKit, Firefox Gecko, and Chromium headers across hostname variants.
 */
async function fetchTargetWebpage(targetUrl: string, customUserAgent?: string) {
  const parsedUrl = new URL(targetUrl);
  const hostname = parsedUrl.hostname.toLowerCase();

  const urlsToTry: string[] = [targetUrl];
  if (!hostname.startsWith('www.') && !hostname.includes('localhost') && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const withWww = new URL(targetUrl);
    withWww.hostname = 'www.' + hostname;
    urlsToTry.push(withWww.toString());
  } else if (hostname.startsWith('www.')) {
    const withoutWww = new URL(targetUrl);
    withoutWww.hostname = hostname.replace(/^www\./, '');
    urlsToTry.push(withoutWww.toString());
  }

  const profiles = [
    {
      name: 'Safari WebKit (Mac)',
      headers: {
        'User-Agent':
          customUserAgent ||
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeoutMs: 8000,
    },
    {
      name: 'Firefox Gecko (Win)',
      headers: {
        'User-Agent':
          customUserAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeoutMs: 8000,
    },
    {
      name: 'Chromium Blink (Win)',
      headers: {
        'User-Agent':
          customUserAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeoutMs: 8000,
    },
  ];

  let lastError: any = null;

  for (const testUrl of urlsToTry) {
    for (const profile of profiles) {
      try {
        const response = await fetch(testUrl, {
          headers: profile.headers,
          redirect: 'follow',
          signal: AbortSignal.timeout(profile.timeoutMs),
        });

        const status = response.status;
        const statusText = response.statusText;
        const contentType = response.headers.get('content-type') || '';
        const rawHtml = await response.text();
        const finalUrl = response.url || testUrl;

        // Collect response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val;
        });

        if (status < 400 || (status === 404 && rawHtml.length > 50)) {
          return {
            status,
            statusText,
            contentType,
            rawHtml,
            finalUrl,
            headers: responseHeaders,
          };
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error(`Unable to establish connection with ${targetUrl}`);
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url, userAgent } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.json({ success: false, error: 'Target URL is required' });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return res.json({
        success: false,
        error: `Invalid URL format: "${targetUrl}". Please enter a valid web address like "example.com" or "https://asos.com".`,
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogle = hostname.includes('google.');

    // If Google request, return high-fidelity Google search DOM immediately
    if (isGoogle) {
      return res.status(200).json({
        success: true,
        originalUrl: targetUrl,
        finalUrl: 'https://www.google.com',
        origin: 'https://www.google.com',
        status: 200,
        statusText: 'OK',
        contentType: 'text/html',
        html: GOOGLE_SEARCH_HTML,
        rawHtmlLength: GOOGLE_SEARCH_HTML.length,
        headers: {},
      });
    }

    const fetchedData = await fetchTargetWebpage(targetUrl, userAgent);
    const { status, statusText, contentType, rawHtml, finalUrl, headers } = fetchedData;
    const finalOrigin = new URL(finalUrl).origin;

    const modifiedHtml = prepareHtmlForObjectSpy(rawHtml, finalOrigin);

    return res.status(200).json({
      success: true,
      originalUrl: targetUrl,
      finalUrl,
      origin: finalOrigin,
      status,
      statusText,
      contentType,
      html: modifiedHtml,
      rawHtmlLength: rawHtml.length,
      headers,
    });
  } catch (err: any) {
    console.warn('Vercel proxy fetch warning:', err?.message || err);

    const reqUrl = req.body?.url ? String(req.body.url).toLowerCase() : '';
    if (reqUrl.includes('google.')) {
      return res.status(200).json({
        success: true,
        originalUrl: req.body.url,
        finalUrl: 'https://www.google.com',
        origin: 'https://www.google.com',
        status: 200,
        statusText: 'OK',
        contentType: 'text/html',
        html: GOOGLE_SEARCH_HTML,
        rawHtmlLength: GOOGLE_SEARCH_HTML.length,
        headers: {},
      });
    }

    let errorMsg = err?.message || 'Failed to fetch the target URL.';
    if (errorMsg === 'fetch failed' || err?.code === 'ENOTFOUND') {
      errorMsg = 'Could not resolve domain. Please check that the URL or domain is publicly accessible.';
    } else if (err?.name === 'TimeoutError' || errorMsg.includes('timeout')) {
      errorMsg = 'Request timed out. The remote host took too long to respond or is blocking proxy connections.';
    }

    return res.status(200).json({
      success: false,
      error: errorMsg,
    });
  }
}
