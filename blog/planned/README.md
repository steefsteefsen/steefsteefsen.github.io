# Planned posts

Drafts and scheduled posts that are **not yet released**. Files in this
folder are:

- not listed in `blog/posts.json`
- not in `feed.xml` / `feed-en.xml`
- not linked from the blog index

They are still pushed to the repo (so multiple machines can pick up the
same draft), but they don't appear publicly until moved to
`blog/posts/` and added to `posts.json`.

## Releasing a planned post

1. Move both language files (`*.html`, `*-en.html`) from `blog/planned/`
   to `blog/posts/`.
2. Add the entry to `blog/posts.json` (newest first — see
   `CLAUDE.md` → "Adding a new blog post" for the schema).
3. Regenerate feeds: `node generate-feed.js` from the repo root.
4. Run the pre-push checks (`npx html-validate ...` and `cd tests && npx jest --ci`).
5. Commit and push.
