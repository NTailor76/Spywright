import { GOOGLE_SEARCH_HTML } from '../src/data/googleSearchPage';

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
      return res.status(400).json({ success: false, error: 'Target URL is required' });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const parsedUrl = new URL(targetUrl);
    const origin = parsedUrl.origin;
    const hostname = parsedUrl.hostname.toLowerCase();
    const isGoogle = hostname.includes('google.');

    // If Google request, return high-fidelity Google search DOM immediately or after fetch attempt
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

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          userAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });

    const status = response.status;
    const statusText = response.statusText;
    const contentType = response.headers.get('content-type') || '';
    const rawHtml = await response.text();
    const finalUrl = response.url || targetUrl;
    const finalOrigin = new URL(finalUrl).origin;

    let modifiedHtml = rawHtml;
    // Remove frame-busters
    modifiedHtml = modifiedHtml.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
    modifiedHtml = modifiedHtml.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
    modifiedHtml = modifiedHtml.replace(/<base\s+[^>]*>/gi, '');

    // Resolve relative asset links
    modifiedHtml = modifiedHtml.replace(
      /(href|src|action)=["']\/(?!\/)([^"']*)["']/gi,
      `$1="${finalOrigin}/$2"`
    );

    const baseTag = `<base href="${finalOrigin}/">`;
    if (/<head[^>]*>/i.test(modifiedHtml)) {
      modifiedHtml = modifiedHtml.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}`);
    } else if (/<html[^>]*>/i.test(modifiedHtml)) {
      modifiedHtml = modifiedHtml.replace(/(<html[^>]*>)/i, `$1\n<head>${baseTag}</head>`);
    } else {
      modifiedHtml = `<head>${baseTag}</head>` + modifiedHtml;
    }

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
      headers: {},
    });
  } catch (err: any) {
    console.error('Vercel proxy fetch error:', err);
    let errorMsg = err.message || 'Failed to fetch the target URL.';
    if (errorMsg === 'fetch failed' || err.code === 'ENOTFOUND') {
      errorMsg = 'Could not resolve domain. Please check the URL or host connectivity.';
    } else if (err.name === 'TimeoutError' || errorMsg.includes('timeout')) {
      errorMsg = 'Request timed out after 12 seconds. The host took too long to respond.';
    }

    return res.status(500).json({
      success: false,
      error: errorMsg,
    });
  }
}
