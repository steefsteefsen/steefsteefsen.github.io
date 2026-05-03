/**
 * @jest-environment node
 *
 * Music-link rule for blog posts.
 *
 * CLAUDE.md (2026-05-03): every new blog post carries a music link
 * that emphasises the message — typically a SoundCloud or YouTube
 * embed — OR an explicit `<!-- no music: <reason> -->` HTML comment
 * justifying the absence (used for grief-toned posts where music
 * would be a "Vibes-Soundtrack").
 *
 * This test enforces the rule for posts whose date is on or after
 * the rule's introduction (2026-05-03). Earlier posts are exempt
 * from automated enforcement — Stefan fills those in personally
 * when the right track surfaces; Claude does NOT auto-pick music
 * for existing posts.
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.resolve(__dirname, '../blog/posts');
const RULE_DATE = '2026-05-03';

const MUSIC_HOSTS = [
  'soundcloud.com',
  'w.soundcloud.com',
  'youtube.com',
  'youtube-nocookie.com',
  'youtu.be',
  'bandcamp.com',
  'spotify.com',
  'open.spotify.com',
];

function isAfterRule(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (!m) return false;
  return m[1] >= RULE_DATE;
}

function hasMusicLink(content) {
  return MUSIC_HOSTS.some(host => content.includes(host));
}

function hasNoMusicJustification(content) {
  return /<!--\s*no music:\s*\S/i.test(content);
}

const allPosts = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.html'));
const enforcedPosts = allPosts.filter(isAfterRule);

describe('Blog post music-link rule (posts on/after ' + RULE_DATE + ')', () => {
  if (enforcedPosts.length === 0) {
    test.skip('no posts under enforcement yet', () => {});
    return;
  }

  test.each(enforcedPosts)(
    'post %s carries a music link OR an explicit no-music justification',
    (filename) => {
      const content = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
      const hasMusic = hasMusicLink(content);
      const hasJustification = hasNoMusicJustification(content);
      // Must have one or the other
      const ok = hasMusic || hasJustification;
      if (!ok) {
        throw new Error(
          `Post "${filename}" has neither a music link nor a "<!-- no music: <reason> -->" comment. ` +
          `Add a SoundCloud/YouTube embed that emphasises the message, ` +
          `or add the no-music justification comment for grief-toned content.`
        );
      }
      expect(ok).toBe(true);
    }
  );
});
