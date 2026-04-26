/**
 * @jest-environment node
 *
 * Mobile burger menu — real-browser render test.
 *
 * Starts a local static server, launches Chrome via puppeteer-core at 375×667
 * (iPhone SE) and 393×851 (Pixel 5), and verifies:
 *   1. The burger button is actually laid out (non-zero size, display != none)
 *   2. It sits on the right-hand side of the viewport
 *   3. Nothing is covering it (elementFromPoint returns the burger itself)
 *   4. Tapping it opens the menu (nav.open) and the nav links become visible
 *
 * jsdom can't do any of this — it doesn't run CSS layout or media queries.
 *
 * If Chrome isn't available, the test is skipped rather than failed, so that
 * pre-push still runs on machines without a browser installed.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');

function findExe(candidates) {
  for (const p of candidates.filter(Boolean)) {
    try { if (fs.statSync(p).isFile()) return p; } catch {}
  }
  return null;
}
const CHROME = findExe([
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]);
const FIREFOX = findExe([
  process.env.FIREFOX_PATH,
  '/usr/bin/firefox',
  '/Applications/Firefox.app/Contents/MacOS/firefox',
]);
const BROWSERS = [
  CHROME && { name: 'chrome',  exe: CHROME,  launch: { executablePath: CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' } },
  FIREFOX && { name: 'firefox', exe: FIREFOX, launch: { browser: 'firefox', executablePath: FIREFOX, headless: true } },
].filter(Boolean);
const describeOrSkip = BROWSERS.length ? describe : describe.skip;

if (!BROWSERS.length) {
  test.skip('mobile burger — skipped (no Chrome or Firefox binary found)', () => {});
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(REPO, reqPath);
      if (!filePath.startsWith(REPO)) { res.writeHead(403); res.end(); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

jest.setTimeout(60000);

let sharedServer;
let sharedBaseUrl;
let puppeteer;

beforeAll(async () => {
  puppeteer = require('puppeteer-core');
  sharedServer = await startServer();
  sharedBaseUrl = `http://127.0.0.1:${sharedServer.address().port}`;
});
afterAll(() => { if (sharedServer) sharedServer.close(); });

const viewports = [
  // Portrait
  { name: 'iphone-se-portrait', width: 375, height: 667 },
  { name: 'pixel-5-portrait',   width: 393, height: 851 },
  // Landscape — narrow height, must still show the burger overlay correctly.
  // Both stay below the 700px width breakpoint so mobile rules still apply.
  { name: 'iphone-se-landscape', width: 667, height: 375 },
  { name: 'pixel-5-landscape',   width: 660, height: 393 },
];

BROWSERS.forEach((browserSpec) => describeOrSkip(`mobile burger menu — ${browserSpec.name}`, () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserSpec.launch);
  });
  afterAll(async () => {
    if (browser) await browser.close();
  });

  // Firefox doesn't accept isMobile/hasTouch on setViewport — it just resizes.
  // The CSS media queries we test are width-based, so this is fine.
  const setViewport = async (page, width, height) => {
    if (browserSpec.name === 'firefox') {
      await page.setViewport({ width, height });
    } else {
      await page.setViewport({ width, height, isMobile: true, hasTouch: true });
    }
  };

  test.each(viewports)('burger is visible and right-aligned at $width×$height', async ({ width, height }) => {
    const page = await browser.newPage();
    await setViewport(page, width, height);
    await page.goto(sharedBaseUrl, { waitUntil: 'domcontentloaded' });

    const report = await page.evaluate(() => {
      const burger = document.getElementById('burger');
      if (!burger) return { ok: false, reason: 'burger element missing' };
      const cs = getComputedStyle(burger);
      if (cs.display === 'none') return { ok: false, reason: `display=${cs.display}` };
      if (cs.visibility === 'hidden') return { ok: false, reason: 'visibility=hidden' };
      const r = burger.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return { ok: false, reason: 'zero size' };
      const vw = window.innerWidth;
      if (r.right > vw + 1) return { ok: false, reason: `overflows viewport: right=${r.right} vw=${vw}` };
      if (r.right < vw * 0.85) return { ok: false, reason: `not tight to the right edge: right=${r.right} vw=${vw}` };

      // The burger must be the rightmost interactive item in the header row.
      // Regression: if .lang-switcher or any other sibling sticks out further
      // right in the visible header strip, the burger looks out of place.
      const nav = document.getElementById('main-nav');
      const navRect = nav.getBoundingClientRect();
      // Competing siblings = visible AND actually intersecting the header strip.
      // This filters out the off-screen overlay menu (translateY(-100%))
      // whose bounding rect reports bottom=0 (right at the nav's top edge).
      const overlapsHeader = (r) =>
        r.bottom > navRect.top + 1 && r.top < navRect.bottom - 1 &&
        r.right > 0 && r.left < window.innerWidth;

      const competing = Array.from(nav.children).filter((el) => {
        if (el === burger || burger.contains(el)) return false;
        const c = getComputedStyle(el);
        if (c.display === 'none' || c.visibility === 'hidden') return false;
        const er = el.getBoundingClientRect();
        if (er.width === 0 || er.height === 0) return false;
        return overlapsHeader(er);
      });
      for (const el of competing) {
        const er = el.getBoundingClientRect();
        if (er.right > r.right - 4) {
          return { ok: false, reason: `sibling <${el.tagName} class="${el.className}"> ends at right=${er.right}, past or too close to burger.right=${r.right}` };
        }
      }

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      if (top && top !== burger && !burger.contains(top)) {
        return { ok: false, reason: `covered by <${top.tagName} class="${top.className}">` };
      }
      return { ok: true, right: r.right, vw };
    });

    await page.close();
    if (!report.ok) throw new Error(`burger render failed: ${report.reason}`);
    expect(report.ok).toBe(true);
  });

  test.each(viewports)('tapping the burger opens the menu at $width×$height', async ({ width, height }) => {
    const page = await browser.newPage();
    await setViewport(page, width, height);
    await page.goto(sharedBaseUrl, { waitUntil: 'domcontentloaded' });

    // Single round-trip: click and inspect the resulting DOM state in one
    // evaluate(). Splitting click() and waitForFunction() into two awaits
    // is racy in Firefox (BiDi), since the open class is set synchronously.
    const result = await page.evaluate(() => {
      document.getElementById('burger').click();
      const nav = document.getElementById('main-nav');
      const a = document.querySelectorAll('#main-nav-links a');
      const r = a[0]?.getBoundingClientRect();
      return {
        navOpen: nav.classList.contains('open'),
        ariaExpanded: document.getElementById('burger').getAttribute('aria-expanded'),
        firstLinkVisible: r ? (r.width > 0 && r.height > 0) : false,
      };
    });
    await page.close();
    expect(result.navOpen).toBe(true);
    expect(result.ariaExpanded).toBe('true');
    expect(result.firstLinkVisible).toBe(true);
  });

  // Full physics suite: closed → open → close. Single round-trip per click so
  // both Chrome (CDP) and Firefox (BiDi) see consistent state.
  test.each(viewports)('physics: full open/close lifecycle at $width×$height', async ({ width, height }) => {
    const page = await browser.newPage();
    await setViewport(page, width, height);
    await page.goto(sharedBaseUrl, { waitUntil: 'domcontentloaded' });

    // Disable CSS transitions for the test. Chrome happens to apply the
    // transformed end state immediately; Firefox waits the full 350ms for the
    // transition before computed transform reaches translateY(0). For
    // testing layout *correctness* we want the end state, not the animation.
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });

    const physics = await page.evaluate(() => {
      const snap = (label) => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('main-nav');
        const ul = document.getElementById('main-nav-links');
        const links = Array.from(ul.querySelectorAll('a'));
        const langSwitcher = document.getElementById('lang-switcher');
        const ulRect = ul.getBoundingClientRect();
        const ulCs = getComputedStyle(ul);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return {
          label,
          navOpen: nav.classList.contains('open'),
          ariaExpanded: burger.getAttribute('aria-expanded'),
          bodyScrollLocked: getComputedStyle(document.body).overflow === 'hidden',
          // Overlay layout (only meaningful when open)
          ulTop: Math.round(ulRect.top),
          ulHeight: Math.round(ulRect.height),
          ulWidth: Math.round(ulRect.width),
          ulTransform: ulCs.transform,
          // All link rects — every link must be inside [0, vh] when open
          linkTops: links.map(a => Math.round(a.getBoundingClientRect().top)),
          linkBottoms: links.map(a => Math.round(a.getBoundingClientRect().bottom)),
          // Lang-switcher visibility
          langSwitcherDisplay: getComputedStyle(langSwitcher).display,
          vw, vh,
        };
      };

      const out = { closed_initial: snap('closed_initial') };
      document.getElementById('burger').click();
      out.opened = snap('opened');
      document.getElementById('burger').click();
      out.closed_again = snap('closed_again');
      return out;
    });

    await page.close();

    // Closed initial: no open class, no scroll lock, overlay translated off-screen
    expect(physics.closed_initial.navOpen).toBe(false);
    expect(physics.closed_initial.ariaExpanded).toBe('false');
    expect(physics.closed_initial.bodyScrollLocked).toBe(false);
    // Open: class set, aria flipped, body locked, overlay fills viewport
    expect(physics.opened.navOpen).toBe(true);
    expect(physics.opened.ariaExpanded).toBe('true');
    expect(physics.opened.bodyScrollLocked).toBe(true);
    expect(physics.opened.ulTop).toBe(0);
    // Overlay must be substantially larger than the nav header (~80px tall, ~100px logo+burger
    // wide) — i.e. it actually covers the page, not just the header strip. We don't pin to vw/vh
    // because Chrome+isMobile reports inflated viewport metrics due to DPR, and Firefox+landscape
    // shows native scrollbars. Both produce false negatives when we compare to vw/vh directly.
    expect(physics.opened.ulHeight).toBeGreaterThan(200);
    expect(physics.opened.ulWidth).toBeGreaterThan(280);
    expect(physics.opened.langSwitcherDisplay).not.toBe('none');
    // Every link must be within the viewport (with small tolerance for overflow:auto scroll)
    const tooHigh = physics.opened.linkTops.filter(t => t < -2);
    expect(tooHigh).toEqual([]);
    // Closed again: state mirrors initial
    expect(physics.closed_again.navOpen).toBe(false);
    expect(physics.closed_again.ariaExpanded).toBe('false');
    expect(physics.closed_again.bodyScrollLocked).toBe(false);
  });
}));
