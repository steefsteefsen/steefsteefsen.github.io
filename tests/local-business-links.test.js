/**
 * @jest-environment node
 *
 * Local-business cards resolve — every .support-card--local must point at
 * a real, reachable entry. CLAUDE.md says Berlin map links go to OSM only;
 * this test goes one step further and verifies that the OSM node/way
 * actually exists (via the OSM API) and that website / instagram links
 * return HTTP < 400.
 *
 * Why this lives in a separate file:
 *   jest-environment-jsdom (used by dom-structure.test.js) does not ship
 *   fetch. We need Node's built-in fetch, which only appears on globalThis
 *   when the test runs in @jest-environment node.
 *
 * Skip when offline:
 *   JEST_SKIP_NETWORK=1 npx jest local-business-links
 *
 * What we check, per card:
 *   1. The card with the expected <h3> exists in index.html
 *   2. The card has at least one external <a href="http..."> link
 *   3. Every external link resolves (HTTP < 400). For openstreetmap.org/
 *      links the API endpoint is queried so a deleted node/way fails
 *      even when the public page would render a generic shell.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Tiny string-based extractor — we don't have jsdom in this env. We pull the
// HTML between each `<div class="support-card support-card--local ...">` and
// the matching closing `</div>` for that block, then yank the <h3> text and
// every <a href="http...">.
function extractLocalCards(htmlText) {
  const cards = [];
  const re = /<div\s+class="support-card support-card--local[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|<\/section)/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) {
    const inner = m[1];
    const h3Match = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const name = h3Match ? h3Match[1].replace(/<[^>]+>/g, '').trim() : '';
    const links = Array.from(inner.matchAll(/<a\s+[^>]*href="(https?:\/\/[^"]+)"/g)).map(x => x[1]);
    const dataI18n = h3Match && h3Match[0].match(/data-i18n="([^"]+)"/);
    cards.push({ name, links, i18nKey: dataI18n ? dataI18n[1] : null });
  }
  return cards;
}

const ALL_LOCAL_CARDS = extractLocalCards(html);
// Drop the placeholder card (the empty consent slot).
const LOCAL_CARDS = ALL_LOCAL_CARDS.filter(c => c.i18nKey !== 'local_placeholder_h3');

// Names that must be present. Update when a card is added or removed.
const EXPECTED_LOCAL_CARDS = [
  'Kaffeerösterei Kiezbohne',
  'Casa Certo',
  'Restlos e.V.',
  "HOWZIT Let's Meet",
  'JZ Kamp',
  'Stabielefeld',
  'Späti Bros',
  'MBzwo',
  "Neneh's Imbiss",
];

function findCard(name) {
  return LOCAL_CARDS.find(c => c.name === name);
}

async function probe(url) {
  const tryFetch = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: ctrl.signal });
      return res.status;
    } finally {
      clearTimeout(t);
    }
  };
  let status = await tryFetch('HEAD');
  if (status === 405 || status === 501) status = await tryFetch('GET');
  return status;
}

async function probeOsm(url) {
  const m = url.match(/openstreetmap\.org\/(node|way|relation)\/(\d+)/);
  if (!m) return await probe(url);
  const [, kind, id] = m;
  return await probe(`https://api.openstreetmap.org/api/0.6/${kind}/${id}`);
}

describe('local-business cards resolve', () => {
  const skipNetwork = process.env.JEST_SKIP_NETWORK === '1';

  test.each(EXPECTED_LOCAL_CARDS)('card "%s" exists in index.html', (name) => {
    expect(findCard(name)).toBeTruthy();
  });

  test.each(EXPECTED_LOCAL_CARDS)('card "%s" has at least one external link', (name) => {
    const card = findCard(name);
    if (!card) return;
    expect(card.links.length).toBeGreaterThan(0);
  });

  const probeTest = skipNetwork ? test.skip.each : test.each;
  probeTest(EXPECTED_LOCAL_CARDS)(
    'card "%s" — every external link resolves (HTTP < 400)',
    async (name) => {
      const card = findCard(name);
      if (!card) return;
      const failures = [];
      for (const url of card.links) {
        try {
          const status = url.includes('openstreetmap.org/')
            ? await probeOsm(url)
            : await probe(url);
          if (status >= 400) failures.push(`${url} → ${status}`);
        } catch (err) {
          failures.push(`${url} → ${err.message || err.name}`);
        }
      }
      expect({ card: name, failures }).toEqual({ card: name, failures: [] });
    },
    60000
  );
});
