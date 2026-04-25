# scripts/

## daily-post.js

Run by the scheduled agent at 10:00 Europe/Berlin. Outputs JSON: yesterday's commits + public files changed (skipping `docs/`, `.claude/`, `logs/`, `tests/`).

The agent reads that JSON, drafts a DE+EN blog post in Stefan's voice, writes the two HTML files, appends to `blog/posts.json`, and runs `node generate-feed.js`.

Manual run:

```bash
node scripts/daily-post.js
```

If the previous 24h has no public-facing commits, the agent skips the day. No empty posts.
