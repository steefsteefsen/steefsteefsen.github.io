#!/usr/bin/env node
// Run: node generate-feed.js
// Reads blog/posts.json and writes feed.xml (RSS 2.0)

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://steefsteefsen.github.io';
const TITLE = 'Stefan-Olav Hüllinghorst — Blog';
const DESCRIPTION = 'Gedanken aus dem täglichen Leben.';
const AUTHOR = 'Stefan-Olav Hüllinghorst';

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

const items = sorted.map(p => `
  <item>
    <title>${escape(p.title)}</title>
    <link>${SITE_URL}/blog/posts/${escape(p.slug)}.html</link>
    <guid isPermaLink="true">${SITE_URL}/blog/posts/${escape(p.slug)}.html</guid>
    <pubDate>${toRFC822(p.date)}</pubDate>
    <description>${escape(p.teaser)}</description>
    <author>${escape(AUTHOR)}</author>
  </item>`).join('');

const lastBuildDate = sorted.length ? toRFC822(sorted[0].date) : new Date().toUTCString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(TITLE)}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escape(DESCRIPTION)}</description>
    <language>de</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

const outPath = path.join(__dirname, 'feed.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`feed.xml geschrieben — ${sorted.length} Einträge.`);
