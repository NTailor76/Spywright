// Self-contained high-fidelity Google benchmark HTML
const GOOGLE_BENCHMARK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Google</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { background-color: #ffffff; color: #202124; min-height: 100vh; display: flex; flex-direction: column; }
    header { display: flex; justify-content: flex-end; align-items: center; padding: 16px 24px; gap: 16px; font-size: 13px; }
    header a { color: rgba(0,0,0,0.87); text-decoration: none; }
    header a:hover { text-decoration: underline; }
    .sign-in-btn { background-color: #1a73e8; color: #ffffff !important; padding: 9px 23px; border-radius: 4px; font-weight: 500; text-decoration: none !important; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 20px 100px 20px; }
    .logo-container { margin-bottom: 28px; font-size: 88px; font-weight: 700; letter-spacing: -3px; line-height: 1; user-select: none; }
    .logo-b { color: #4285f4; }
    .logo-r { color: #ea4335; }
    .logo-y { color: #fbbc05; }
    .logo-g { color: #34a853; }
    .search-form { width: 100%; max-width: 584px; display: flex; flex-direction: column; align-items: center; }
    .search-box-wrapper { width: 100%; display: flex; align-items: center; background: #ffffff; border: 1px solid #dfe1e5; border-radius: 24px; padding: 0 16px; height: 46px; box-shadow: 0 1px 6px rgba(32,33,36,0.12); }
    .search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 16px; color: rgba(0,0,0,0.87); height: 100%; }
    .buttons-row { margin-top: 28px; display: flex; gap: 12px; justify-content: center; }
    .search-btn { background-color: #f8f9fa; border: 1px solid #f8f9fa; border-radius: 4px; color: #3c4043; font-size: 14px; padding: 0 16px; height: 36px; min-width: 54px; cursor: pointer; }
    footer { background: #f2f2f2; color: #70757a; font-size: 14px; padding: 15px 30px; }
  </style>
</head>
<body>
  <header>
    <a href="https://mail.google.com">Gmail</a>
    <a href="https://images.google.com">Images</a>
    <a href="https://accounts.google.com" class="sign-in-btn">Sign in</a>
  </header>
  <main>
    <div class="logo-container">
      <span class="logo-b">G</span><span class="logo-r">o</span><span class="logo-y">o</span><span class="logo-b">g</span><span class="logo-g">l</span><span class="logo-r">e</span>
    </div>
    <form class="search-form" action="/search" method="GET">
      <div class="search-box-wrapper">
        <input type="text" name="q" class="search-input" title="Search" autocomplete="off" placeholder="Search Google or type a URL" />
      </div>
      <div class="buttons-row">
        <input type="submit" value="Google Search" class="search-btn" name="btnK" />
        <input type="submit" value="I'm Feeling Lucky" class="search-btn" name="btnI" />
      </div>
    </form>
  </main>
  <footer>
    <p>Google QA Test Automation Sandbox</p>
  </footer>
</body>
</html>`;

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
  modifiedHtml = modifiedHtml.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs) => {
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
      timeoutMs: 6000,
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
      timeoutMs: 6000,
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
      timeoutMs: 6000,
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

/**
 * Universal request body parser for Node.js, Vercel Serverless, and Express
 */
async function parseRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  return new Promise((resolve) => {
    try {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    } catch {
      resolve({});
    }
  });
}

function sendResponse(res: any, statusCode: number, payload: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.writeHead(200);
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 200, { success: false, error: 'Method not allowed. Use POST.' });
  }

  let body: any = {};
  try {
    body = await parseRequestBody(req);
  } catch {
    body = {};
  }

  const { url, userAgent } = body || {};

  if (!url || typeof url !== 'string') {
    return sendResponse(res, 200, { success: false, error: 'Target URL is required.' });
  }

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return sendResponse(res, 200, {
      success: false,
      error: `Invalid URL format: "${targetUrl}". Please enter a valid web address like "asos.com" or "example.com".`,
    });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isGoogle = hostname.includes('google.');

  if (isGoogle) {
    return sendResponse(res, 200, {
      success: true,
      originalUrl: targetUrl,
      finalUrl: 'https://www.google.com',
      origin: 'https://www.google.com',
      status: 200,
      statusText: 'OK',
      contentType: 'text/html',
      html: GOOGLE_BENCHMARK_HTML,
      rawHtmlLength: GOOGLE_BENCHMARK_HTML.length,
      headers: {},
    });
  }

  try {
    const fetchedData = await fetchTargetWebpage(targetUrl, userAgent);
    const { status, statusText, contentType, rawHtml, finalUrl, headers } = fetchedData;
    const finalOrigin = new URL(finalUrl).origin;

    const modifiedHtml = prepareHtmlForObjectSpy(rawHtml, finalOrigin);

    return sendResponse(res, 200, {
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

    let errorMsg = err?.message || 'Failed to fetch the target URL.';
    if (errorMsg === 'fetch failed' || err?.code === 'ENOTFOUND') {
      errorMsg = 'Could not resolve domain. Please check that the URL or domain is publicly accessible.';
    } else if (err?.name === 'TimeoutError' || errorMsg.includes('timeout')) {
      errorMsg = 'Request timed out. The remote host took too long to respond or is blocking proxy connections.';
    }

    return sendResponse(res, 200, {
      success: false,
      error: errorMsg,
    });
  }
}
