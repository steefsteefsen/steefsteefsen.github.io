/**
 * @jest-environment node
 *
 * Red-Flag Easter-Egg integration test.
 *
 * Loads index.html in headless Chrome, simulates hovering the
 * .scroll-hint element three times in a row, and asserts that
 * the data-flag-stage attribute escalates 1 → 2 → 3 → 3 (capped),
 * and resets to 1 on mouseleave. Captures console.log output for
 * debugging, takes a screenshot per stage so we can eyeball the
 * actual rendered flag.
 *
 * Skip with JEST_SKIP_PUPPETEER=1 if no chrome binary is around.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_BIN = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const URL = process.env.SITE_URL || 'http://localhost:8080/';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

const skipPuppeteer =
  process.env.JEST_SKIP_PUPPETEER === '1' ||
  !fs.existsSync(CHROME_BIN);

const maybe = skipPuppeteer ? describe.skip : describe;

maybe('red flag — Pianosa hover escalation', () => {
  let browser;
  let page;
  let consoleLines;

  beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    browser = await puppeteer.launch({
      executablePath: CHROME_BIN,
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    consoleLines = [];
    page.on('console', (msg) => consoleLines.push(`[${msg.type()}] ${msg.text()}`));
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('.scroll-hint', { timeout: 10000 });
    // Scroll the scroll-hint into view + give the hero fade-in animation a chance.
    await page.evaluate(() => {
      const el = document.querySelector('.scroll-hint');
      if (el) el.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1500));
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('scroll-hint exists in the DOM', async () => {
    const exists = await page.$('.scroll-hint');
    expect(exists).not.toBeNull();
  });

  test('initial data-flag-stage is "1"', async () => {
    const stage = await page.$eval('.scroll-hint', el => el.getAttribute('data-flag-stage'));
    expect(stage).toBe('1');
  });

  test('hover sequence escalates 1 → 2 → 3 → 3 (capped) and resets to 1', async () => {
    const hint = await page.$('.scroll-hint');
    expect(hint).not.toBeNull();

    const box = await hint.boundingBox();
    expect(box).not.toBeNull();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Park cursor far away so the first move into the element is a real mouseenter.
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 50));

    const stages = [];
    for (let i = 0; i < 4; i++) {
      // mouseleave
      await page.mouse.move(0, 0);
      await new Promise(r => setTimeout(r, 80));
      // mouseenter
      await page.mouse.move(cx, cy);
      await new Promise(r => setTimeout(r, 120));
      const s = await page.$eval('.scroll-hint', el => el.getAttribute('data-flag-stage'));
      stages.push(s);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `red-flag-hover-${i + 1}.png`),
        clip: {
          x: Math.max(0, box.x - 40),
          y: Math.max(0, box.y - 20),
          width: Math.min(200, 1280 - Math.max(0, box.x - 40)),
          height: Math.min(120, 800 - Math.max(0, box.y - 20)),
        },
      });
    }

    // Move away one last time and snapshot the reset.
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 120));
    const afterLeave = await page.$eval('.scroll-hint', el => el.getAttribute('data-flag-stage'));

    // Diagnostic dump if anything goes wrong — printed via console.log so
    // jest's output contains the full picture.
    console.log('observed stages:', stages, 'after-leave:', afterLeave);
    console.log('console captured by page:', consoleLines.slice(-12));

    expect(stages).toEqual(['2', '3', '3', '3']);
    expect(afterLeave).toBe('1');
  }, 30000);

  test('flag svg is visible (opacity > 0.5) while hovered', async () => {
    const hint = await page.$('.scroll-hint');
    const box = await hint.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await new Promise(r => setTimeout(r, 200));
    const opacity = await page.$eval('.scroll-hint .red-flag', el =>
      parseFloat(getComputedStyle(el).opacity)
    );
    expect(opacity).toBeGreaterThan(0.5);
  }, 15000);
});
