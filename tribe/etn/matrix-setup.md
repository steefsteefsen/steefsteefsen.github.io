# Matrix — Setup Cheatsheet

For Stefan and anyone you're inviting. Keep it short.

## For you (Stefan) — host the room

1. **Pick a homeserver.** Start with one of:
   - `matrix.org` (easiest, biggest, public)
   - `tchncs.de` (German, privacy-aligned, free)
   - `kde.org` (foundation-run, stable)

2. **Make an account.** Use your Ente Auth for the 2FA when you turn it on.

3. **Install Element** (the standard Matrix client):
   - Desktop: `element.io/download`
   - Mobile: App Store / Play Store / F-Droid → "Element"
   - Or try `Cinny` (web/desktop) or `SchildiChat` (Android, nicer UI) if Element annoys you.

4. **Create the room:**
   - Name: `European Tribe` (room alias: `#european-tribe:<your-server>`)
   - Visibility: **Private (invite only)**
   - End-to-end encryption: **ON** (cannot be turned off later — that's the point)
   - Topic: "A small network of people in Europe who refuse the spectacle and build the alternative. See pinned messages."

5. **Pin two messages:**
   - Link to `docs/etn/README.md` (or paste the values short version)
   - The one-paragraph code of conduct (see `30-day-plan.md`)

6. **Set yourself as admin.** Add 1–2 trusted people as moderators before the room grows past 10.

7. **Save your recovery key.** Element will give you one for encrypted message recovery. Lose it = lose your message history if you log out. Store it like the Ente recovery key — paper, drawer.

## For invitees — joining

1. Pick a Matrix client (Element is fine).
2. Make an account on any homeserver. The federation means your `@you:matrix.org` can join Stefan's room on `tchncs.de` — it just works.
3. Stefan sends you an invite link or invites your handle directly.
4. Accept. Verify your device when prompted (do this — it's how end-to-end encryption knows you're you).
5. Save your recovery key.
6. Write your 3-sentence intro.

## Common pitfalls

- **"I can't see old messages."** End-to-end encryption + a new device = you can't decrypt history sent before you joined. This is by design. Cross-sign your devices to share keys with yourself.
- **"It's slow."** Element on a big server can be sluggish. Try Cinny or SchildiChat.
- **"I lost my recovery key and got logged out."** You lose your encrypted history. Accounts are recoverable; messages aren't. Save the key.

## Why not Discord / WhatsApp / Signal?

- **Discord:** owned by a US company, not encrypted by default in DMs let alone servers, ad-driven business model. Antithesis of what we're doing.
- **WhatsApp:** Meta. Same reason.
- **Signal:** great app, but it's a US-based nonprofit with a phone-number requirement, and it's a 1:1/small-group messenger, not a community platform.
- **Matrix:** federated (no single owner can shut us down), end-to-end encrypted, open protocol, EU-hostable. Imperfect, but the only one that fits.
