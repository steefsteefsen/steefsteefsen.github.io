/**
 * Video consistency tests — every embedded iframe sits in the right card.
 *
 * Prevents the recurring mix-up where idol card X gets the YouTube embed
 * that belongs to idol Y. Two layers:
 *
 *   Stage 1 (offline, structural):
 *     - every <iframe> inside a .value-card or .support-card must have a
 *       `title` attribute,
 *     - the iframe src must point to youtube-nocookie.com or a whitelisted
 *       privacy-respecting embed host (no naked youtube.com / vimeo with
 *       tracking),
 *     - the iframe `title` must contain the card's <h3> text (case- and
 *       diacritic-insensitive substring match), or vice versa, so a
 *       Gysi card can't carry an iframe titled "Trey Parker — interview".
 *
 *   Stage 2 (network, opt-in via JEST_SKIP_NETWORK=0):
 *     - for each YouTube embed, query the YouTube oEmbed API
 *       (https://www.youtube.com/oembed?url=...) and verify the official
 *       video title contains the card's <h3> name. Catches the case where
 *       title attribute and src disagree because someone fixed the title
 *       but not the video ID, or vice versa.
 *
 * Skip with JEST_SKIP_NETWORK=1 when offline.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Tiny string-based extractor — pull every card that contains an <iframe>.
// We don't need jsdom for this; regex over the HTML is enough and avoids the
// jsdom-vs-fetch issue that bit us in dom-structure.test.js.
function extractCardsWithIframes(htmlText) {
  const cards = [];
  // Greedy-match a card div, but stop at the next sibling card so we don't
  // pick up two cards in one match. The closing </div> alignment is brittle
  // in raw HTML, so we use a heuristic: a card runs from `<div class="(value|support)-card...">`
  // until the next such opener or until `</section>`.
  const re = /<div\s+class="(value-card|support-card[^"]*)"[^>]*>([\s\S]*?)(?=<div\s+class="(?:value-card|support-card[^"]*)"|<\/section)/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) {
    const inner = m[2];
    if (!inner.includes('<iframe')) continue;
    const h3Match = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const name = h3Match ? h3Match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() : '';
    const iframes = Array.from(inner.matchAll(/<iframe\s+([^>]*?)>/g)).map(im => {
      const attrs = im[1];
      const src = (attrs.match(/\bsrc="([^"]+)"/) || [])[1] || '';
      const title = (attrs.match(/\btitle="([^"]+)"/) || [])[1] || '';
      return { src, title };
    });
    cards.push({ name, iframes });
  }
  return cards;
}

const CARDS_WITH_IFRAMES = extractCardsWithIframes(html);

// Whitelisted privacy-respecting embed hosts. youtube.com (without nocookie)
// is rejected because it sets tracking cookies on render.
const ALLOWED_EMBED_HOSTS = [
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'w.soundcloud.com',
];

// Normalise a string for substring matching: lowercase, strip diacritics,
// strip punctuation so "Tschaikowski" matches "Tchaikovsky" only loosely —
// we keep the original-script form first, but remove obvious noise.
function normalise(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('video consistency — Stage 1 (structural)', () => {
  test('at least one card has an iframe (sanity check)', () => {
    expect(CARDS_WITH_IFRAMES.length).toBeGreaterThan(0);
  });

  test.each(CARDS_WITH_IFRAMES.map(c => [c.name, c.iframes]))(
    'card "%s" — every iframe has a non-empty title attribute',
    (name, iframes) => {
      const missing = iframes.filter(f => !f.title);
      expect({ card: name, missing }).toEqual({ card: name, missing: [] });
    }
  );

  test.each(CARDS_WITH_IFRAMES.map(c => [c.name, c.iframes]))(
    'card "%s" — every iframe src is on the allowed host list',
    (name, iframes) => {
      const blocked = iframes
        .map(f => f.src)
        .filter(src => {
          try {
            const host = new URL(src).host;
            return !ALLOWED_EMBED_HOSTS.includes(host);
          } catch {
            return true;
          }
        });
      expect({ card: name, blocked }).toEqual({ card: name, blocked: [] });
    }
  );

  test.each(CARDS_WITH_IFRAMES.map(c => [c.name, c.iframes]))(
    'card "%s" — every iframe title references the card name (or vice versa)',
    (name, iframes) => {
      const cardNorm = normalise(name);
      // Skip cards with a generic/empty name — they can't be cross-referenced.
      if (!cardNorm) return;
      const mismatches = iframes
        .filter(f => {
          const titleNorm = normalise(f.title);
          if (!titleNorm) return true;
          // Either direction: card name in title, or title's first word in card.
          if (titleNorm.includes(cardNorm)) return false;
          if (cardNorm.includes(titleNorm.split(' ')[0])) return false;
          // Allow: card name's last word (often surname) appears in title.
          const lastWord = cardNorm.split(' ').pop();
          if (lastWord.length >= 4 && titleNorm.includes(lastWord)) return false;
          return true;
        })
        .map(f => `title="${f.title}" src="${f.src}"`);
      expect({ card: name, mismatches }).toEqual({ card: name, mismatches: [] });
    }
  );
});

// ── Stage 2 — opt-in network probe via YouTube oEmbed ─────────────────────
describe('video consistency — Stage 2 (network)', () => {
  const skipNetwork = process.env.JEST_SKIP_NETWORK === '1';
  const probeTest = skipNetwork ? test.skip.each : test.each;

  // Pull all youtube-nocookie embed URLs and convert to canonical youtube.com
  // watch URLs that oEmbed accepts.
  function toWatchUrl(embedSrc) {
    const m = embedSrc.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
    if (!m) return null;
    return `https://www.youtube.com/watch?v=${m[1]}`;
  }

  async function oembed(watchUrl) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
        { signal: ctrl.signal }
      );
      if (!res.ok) return { error: `oembed http ${res.status}` };
      const data = await res.json();
      return { title: data.title || '', author: data.author_name || '' };
    } catch (err) {
      return { error: err.message || err.name };
    } finally {
      clearTimeout(t);
    }
  }

  const ytCards = CARDS_WITH_IFRAMES
    .map(c => ({
      name: c.name,
      ytUrls: c.iframes.map(f => toWatchUrl(f.src)).filter(Boolean),
    }))
    .filter(c => c.ytUrls.length > 0);

  probeTest(ytCards.map(c => [c.name, c.ytUrls]))(
    'card "%s" — YouTube video title via oEmbed references the card name',
    async (name, ytUrls) => {
      const cardNorm = normalise(name);
      const failures = [];
      for (const url of ytUrls) {
        const r = await oembed(url);
        if (r.error) {
          failures.push(`${url} → ${r.error}`);
          continue;
        }
        const titleNorm = normalise(r.title);
        const authorNorm = normalise(r.author);
        const lastWord = cardNorm.split(' ').pop();
        const hit =
          titleNorm.includes(cardNorm) ||
          authorNorm.includes(cardNorm) ||
          (lastWord.length >= 4 && (titleNorm.includes(lastWord) || authorNorm.includes(lastWord)));
        if (!hit) {
          failures.push(`${url} → title="${r.title}", author="${r.author}"`);
        }
      }
      expect({ card: name, failures }).toEqual({ card: name, failures: [] });
    },
    60000
  );
});
