# Timo — Onboarding

Welcome. This folder is your starting point. Read it once. Then start shipping.

## Day 1 — Get running (90 min, max)

1. **Install Claude Code**
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude
   ```
   Sign in with your own Claude account. Use yours, not Stefan's.

2. **Fork & clone this repo**
   - Fork `gitlab.com/steefSteefsen/steefsteefsen-github-io` to your own GitLab.
   - Clone your fork locally.
   - `cd` into it and run `claude` from inside.

3. **Drop in the global CLAUDE.md**
   Copy `docs/timo/CLAUDE-global.md` to `~/.claude/CLAUDE.md`. This is your operating manual — Claude reads it every session.

4. **Run the tests once, so you know they pass**
   ```bash
   cd tests && npx jest
   ```
   If they don't pass on a fresh clone, ping Stefan. That's a bug, not your fault.

5. **Pick PR #1 from `first-prs.md`. Ship it.**

## How to ask for help

- **<10 min stuck:** keep going.
- **10–30 min stuck:** ask Claude differently. Rephrase the problem.
- **>30 min stuck:** ping Stefan with: what you're trying to do, what you tried, what happened. Don't apologize. That's the deal.

## What "ready" means

A PR is ready when:
- [ ] Tests pass locally (`cd tests && npx jest`)
- [ ] You can describe in one sentence what changed and why
- [ ] You read your own diff before pushing
- [ ] If it's UI, you opened it in a browser at 375px and 1280px

That's it. No checklist theater.
