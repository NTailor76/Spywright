export const GOOGLE_SEARCH_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Google</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { background-color: #ffffff; color: #202124; min-height: 100vh; display: flex; flex-direction: column; }
    
    /* Top Header */
    header { display: flex; justify-content: flex-end; align-items: center; padding: 16px 24px; gap: 16px; font-size: 13px; }
    header a { color: rgba(0,0,0,0.87); text-decoration: none; }
    header a:hover { text-decoration: underline; }
    .apps-btn { background: transparent; border: none; padding: 8px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #5f6368; }
    .apps-btn:hover { background-color: rgba(60,64,67,0.08); }
    .sign-in-btn { background-color: #1a73e8; color: #ffffff !important; padding: 9px 23px; border-radius: 4px; font-weight: 500; text-decoration: none !important; border: 1px solid transparent; transition: background-color 0.2s, box-shadow 0.2s; }
    .sign-in-btn:hover { background-color: #1b66c9; box-shadow: 0 1px 3px 1px rgba(66,133,244,0.15); }

    /* Center Main */
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 20px 100px 20px; }
    .logo-container { margin-bottom: 28px; }
    .logo-text { font-size: 88px; font-weight: 700; letter-spacing: -3px; line-height: 1; user-select: none; }
    .logo-b { color: #4285f4; }
    .logo-r { color: #ea4335; }
    .logo-y { color: #fbbc05; }
    .logo-g { color: #34a853; }

    /* Search Form */
    .search-form { width: 100%; max-width: 584px; display: flex; flex-direction: column; align-items: center; }
    .search-box-wrapper { width: 100%; display: flex; align-items: center; background: #ffffff; border: 1px solid #dfe1e5; border-radius: 24px; padding: 0 16px; height: 46px; box-shadow: 0 1px 6px rgba(32,33,36,0.12); transition: box-shadow 0.2s, border-color 0.2s; }
    .search-box-wrapper:hover, .search-box-wrapper:focus-within { border-color: rgba(223,225,229,0); box-shadow: 0 2px 8px 1px rgba(64,60,67,0.24); }
    
    .search-icon { color: #9aa0a6; margin-right: 12px; display: flex; align-items: center; }
    .search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 16px; color: rgba(0,0,0,0.87); height: 100%; }
    .search-tools { display: flex; align-items: center; gap: 12px; margin-left: 8px; }
    .tool-btn { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #4285f4; }

    /* Buttons row */
    .buttons-row { margin-top: 28px; display: flex; gap: 12px; justify-content: center; }
    .search-btn { background-color: #f8f9fa; border: 1px solid #f8f9fa; border-radius: 4px; color: #3c4043; font-size: 14px; padding: 0 16px; height: 36px; min-width: 54px; text-align: center; cursor: pointer; user-select: none; }
    .search-btn:hover { border-color: #dadce0; color: #202124; background-color: #f1f3f4; }
    .search-btn:focus { border-color: #4285f4; outline: none; }

    /* Languages row */
    .languages-row { margin-top: 28px; font-size: 13px; color: #4d5156; text-align: center; }
    .languages-row a { color: #1a0dab; text-decoration: none; margin-left: 4px; }
    .languages-row a:hover { text-decoration: underline; }

    /* Footer */
    footer { background: #f2f2f2; color: #70757a; font-size: 14px; }
    .footer-location { padding: 15px 30px; border-bottom: 1px solid #dadce0; }
    .footer-links { display: flex; flex-wrap: wrap; justify-content: space-between; padding: 0 20px; }
    .footer-links-group { display: flex; flex-wrap: wrap; }
    .footer-links a { color: #70757a; padding: 15px; text-decoration: none; display: block; }
    .footer-links a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <a href="https://mail.google.com" data-test="header-gmail" aria-label="Gmail">Gmail</a>
    <a href="https://images.google.com" data-test="header-images" aria-label="Images">Images</a>
    <button type="button" class="apps-btn" aria-label="Google apps" title="Google apps" id="gbwa">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
      </svg>
    </button>
    <a href="https://accounts.google.com" class="sign-in-btn" role="button" aria-label="Sign in" id="gb_70">Sign in</a>
  </header>

  <main>
    <div class="logo-container">
      <div class="logo-text" aria-label="Google">
        <span class="logo-b">G</span><span class="logo-r">o</span><span class="logo-y">o</span><span class="logo-b">g</span><span class="logo-g">l</span><span class="logo-r">e</span>
      </div>
    </div>

    <form class="search-form" action="https://www.google.com/search" method="GET" role="search" id="search-form">
      <div class="search-box-wrapper">
        <div class="search-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </div>

        <input
          type="search"
          name="q"
          id="search-input"
          class="search-input"
          role="combobox"
          aria-autocomplete="both"
          aria-label="Search"
          title="Search"
          placeholder="Search Google or type a URL"
          autocomplete="off"
          spellcheck="false"
          data-test="search-input"
        />

        <div class="search-tools">
          <button type="button" class="tool-btn" aria-label="Search by voice" title="Search by voice" id="voice-search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285f4">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#34a853"></path>
            </svg>
          </button>
          <button type="button" class="tool-btn" aria-label="Search by image" title="Search by image" id="lens-search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ea4335">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#fbbc05"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="buttons-row">
        <input
          type="submit"
          name="btnK"
          class="search-btn"
          value="Google Search"
          aria-label="Google Search"
          data-test="btn-search"
          id="btn-search"
        />
        <input
          type="submit"
          name="btnI"
          class="search-btn"
          value="I'm Feeling Lucky"
          aria-label="I'm Feeling Lucky"
          data-test="btn-lucky"
          id="btn-lucky"
        />
      </div>
    </form>

    <div class="languages-row" id="languages">
      Google offered in:
      <a href="#">Español</a>
      <a href="#">Français</a>
      <a href="#">Deutsch</a>
      <a href="#">日本語</a>
    </div>
  </main>

  <footer>
    <div class="footer-location" id="location-badge">United States</div>
    <div class="footer-links">
      <div class="footer-links-group">
        <a href="https://about.google/" data-test="link-about">About</a>
        <a href="https://ads.google.com/" data-test="link-advertising">Advertising</a>
        <a href="https://www.google.com/services/" data-test="link-business">Business</a>
        <a href="https://google.com/search/howsearchworks/" data-test="link-how-search-works">How Search works</a>
      </div>
      <div class="footer-links-group">
        <a href="https://policies.google.com/privacy" data-test="link-privacy">Privacy</a>
        <a href="https://policies.google.com/terms" data-test="link-terms">Terms</a>
        <a href="#" data-test="link-settings" id="settings-link">Settings</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
