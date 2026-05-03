#!/usr/bin/env node
// Run: node generate-feed.js
// Reads blog/posts.json and writes feed.xml (RSS 2.0, DE items) and feed-en.xml (EN items).

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://steefsteefsen.github.io';
const AUTHOR = 'Steef';

const postsPath = path.join(__dirname, 'blog', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const sorted = posts.slice().sort((a, b) => b.date.localeCompare(a.date));

function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toRFC822(dateStr) {
  return new Date(dateStr).toUTCString();
}

function buildFeed(lang, title, description, outFile) {
  const items = sorted
    .filter(p => p.translations && p.translations[lang])
    .map(p => {
      const t = p.translations[lang];
      return `
  <item>
    <title>${escape(t.title)}</title>
    <link>${SITE_URL}/blog/posts/${escape(t.slug)}.html</link>
    <guid isPermaLink="true">${SITE_URL}/blog/posts/${escape(t.slug)}.html</guid>
    <pubDate>${toRFC822(p.date)}</pubDate>
    <description>${escape(t.teaser)}</description>
    <author>${escape(AUTHOR)}</author>
  </item>`;
    })
    .join('');

  const lastBuildDate = sorted.length ? toRFC822(sorted[0].date) : new Date().toUTCString();
  const feedUrl = lang === 'de' ? `${SITE_URL}/feed.xml` : `${SITE_URL}/feed-${lang}.xml`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(title)}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escape(description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  fs.writeFileSync(path.join(__dirname, outFile), xml, 'utf8');
  const count = sorted.filter(p => p.translations && p.translations[lang]).length;
  console.log(`${outFile} geschrieben — ${count} Einträge (${lang}).`);
}

buildFeed('de', 'Steef — Blog', 'Gedanken aus dem täglichen Leben.', 'feed.xml');
buildFeed('en', 'Steef — Blog', 'Thoughts from everyday life.', 'feed-en.xml');
