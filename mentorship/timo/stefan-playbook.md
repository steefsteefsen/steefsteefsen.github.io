# Stefan's Playbook — Mentoring Timo

For your eyes. Short, because you'll re-read it twice and then never again.

## Rules of engagement

1. **Review his diffs, not his process.** Don't ask how he did it. Ask why this change.
2. **Block on main, not on him.** He pushes to his fork. You merge to your main when ready. He never force-pushes anything you care about.
3. **One PR open at a time.** ADHD discipline — finish before starting.
4. **30-min weekly sync.** Walk through what shipped, what didn't, what's next. That's it.

## When he asks for help

The Socratic move:
- "What did you try?"
- "What did Claude suggest?"
- "What's the smallest thing you could change to test that?"

Don't solve it for him unless he's been blocked for >24h on something real.

## Red flags

- He's opened 4 PRs in 2 days, none merged → too many parallel threads. Tell him to close 3.
- He's stopped pushing for >5 days with no message → check in, no judgment.
- His diffs include refactors you didn't ask for → remind him: focused diffs.
- He asks for permission before every change → tell him to just ship to his fork.

## Promotion criteria

After PR #1–4 are merged, he's earned:
- Direct push access to a `timo/*` branch namespace on the main repo
- A look at CareerGraph
- Real money for real work, when there is real work

## Things not to do

- Don't write the playbook longer. He won't read it. You won't either.
- Don't pair-program every session. He needs to struggle alone sometimes.
- Don't praise him for shipping garbage. He'll know you're lying.
