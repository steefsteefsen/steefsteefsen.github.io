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

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const p of candidates) {
    try { if (fs.statSync(p).isFile()) return p; } catch {}
  }
  return null;
}

const CHROME = findChrome();
const describeOrSkip = CHROME ? describe : describe.skip;

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

describeOrSkip('mobile burger menu — live render', () => {
  jest.setTimeout(30000);

  let server;
  let baseUrl;
  let browser;
  let puppeteer;

  beforeAll(async () => {
    puppeteer = require('puppeteer-core');
    server = await startServer();
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
    browser = await puppeteer.launch({
      executablePath: CHROME,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    });
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (server) server.close();
  });

  const viewports = [
    { name: 'iphone-se', width: 375, height: 667 },
    { name: 'pixel-5',   width: 393, height: 851 },
  ];

  test.each(viewports)('burger is visible and right-aligned at $width×$height', async ({ width, height }) => {
    const page = await browser.newPage();
    await page.setViewport({ width, height, isMobile: true, hasTouch: true });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

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
    await page.setViewport({ width, height, isMobile: true, hasTouch: true });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Use click instead of tap — puppeteer's tap insists on a non-zero
    // clickable rect visible in the viewport, and sometimes fails with fixed
    // nav on mobile. click() uses the same code path for our handler anyway.
    await page.evaluate(() => document.getElementById('burger').click());
    await page.waitForFunction(
      () => document.getElementById('main-nav').classList.contains('open'),
      { timeout: 2000 }
    );
    const linksVisible = await page.evaluate(() => {
      const a = document.querySelectorAll('#main-nav-links a');
      if (!a.length) return false;
      const r = a[0].getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    await page.close();
    expect(linksVisible).toBe(true);
  });
});
