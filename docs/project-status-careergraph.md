# CareerGraph — Project Status & Roadmap

**Project Owner:** Stefan Hüllinghorst, Berlin (from Bielefeld)
**Contact:** stefan@huellinghorst.info | +49 172 749 1769
**LinkedIn:** linkedin.com/in/stefan-huellinghorst
**Last Updated:** 2026-04-07

---

## Mission

A Claude-powered career trajectory platform that helps people navigate the AI labor transition. Users upload their CV, go through a guided biographical career interview (powered by Claude), and receive three concrete career recommendations based on a data-driven Ikigai framework (4 dimensions: What I love / What I'm good at / What the world needs / What pays). The anonymized decision data becomes a research dataset complementing Anthropic's Economic Index (Massenkoff & McCrory, March 2026).

---

## The Problem

- 49% of US jobs have 25%+ of tasks AI-exposed (Anthropic, March 2026)
- Hiring for workers aged 22–25 in AI-exposed roles dropped 14% (Massenkoff & McCrory, 2026)
- 92 million jobs displaced globally by 2030 — 170 million created (WEF Future of Jobs 2025)
- 59% of the global workforce needs reskilling by 2030 (WEF)
- 1.35 million occupational transitions per year in Germany alone (IAB/SOEP)

Existing tools (LinkedIn, StepStone, career coaches) address job search, not trajectory. There is no platform that combines biographical depth, AI-powered analysis, and structured research output.

---

## Current Status: Pre-Founding

### ✅ Completed

- **Problem validation:** 8 beta users tested via Claude project over 8 weeks. Profiles: AI team lead, Zeiss cybersecurity expert, Ukrainian refugee web developer, employment lawyer (Köln), Italian art history PhD, social pedagogue, cybersecurity specialist, 21-year-old career starter.
- **Pitch deck:** 17-slide PPTX (dark navy, Georgia + Calibri). Includes matplotlib radar chart (Anthropic Economic Index data), top-10 bar chart, competitive landscape, Ikigai framework, revenue model, timeline, founder slide, sources appendix.
- **Concept papers:** German PDF for academic partners (Bielefeld), English PDF for investor outreach (Deedy Das, Menlo Ventures).
- **Outreach emails:** Written and scheduled. German for Bielefeld professors, English for Anthology Fund.
- **Website:** Landing page (index.html) + interactive pitch deck (deck.html) built, ready to deploy.

### 📅 2026-04-07

- i18n: alle Karten-Inhalte (Projects, Journey, Built With, Support, Idols) für alle 16 Sprachen übersetzt und mit `data-i18n`-Attributen versehen
- i18n: deutsche Übersetzungen korrigiert (Grammatik, Tonalität, Fremdwörter)
- i18n: `?lang=`-URL-Parameter eingeführt — Sprache jetzt über URL teilbar (z.B. `?lang=de`)
- **Kontext:** Stefan ist seit 01.04.2026 bei der Siemens AG angestellt und wird dort bleiben. Die Projekte (careergraph.io, diedorismachtdasgift.io, Homepage) laufen als Side Projects weiter.

### 🔄 In Progress

- **Academic outreach:** Email to Prof. Dr. Ursula Mense-Petermann (AB 10, Economic Sociology) and Arbeitsbereich 5 (Social Structure & Inequality), Universität Bielefeld — ready to send.
- **Investor outreach:** Email to Deedy Das, Partner at Menlo Ventures / Anthology Fund — ready to send.
- **Domain registration:** careergraph.io — recommended registrar: Cloudflare Registrar.
- **Co-founder search:** Looking for the right CEO/CTO. Requires someone who can work with directness and grow with it.

### 📋 To Do

- [ ] Register careergraph.io domain (Cloudflare)
- [ ] Deploy landing page + pitch deck (Cloudflare Pages or GitHub Pages)
- [ ] Send academic outreach email (Bielefeld, 08:30)
- [ ] Send investor outreach email (Deedy Das, 14:00 Berlin / 08:00 ET)
- [ ] Register GmbH (planned Q2 2026)
- [ ] Draft GDPR DPIA (Art. 9 special category data — health, family, migration — existential, not optional)
- [ ] Research backup academic partners: WZB Berlin, IAB Nürnberg
- [ ] Define unit economics: CAC, LTV, conversion assumptions
- [ ] Build MVP (tech stack TBD — see below)
- [ ] Apply to Anthology Fund ($100K+, $25K Claude API credits)

---

## Revenue Model (sequenced)

| Stream | Description | Target |
|--------|-------------|--------|
| Freemium SaaS | Free: CV + basic journey. Premium €9.99/mo: full 3-path + quarterly check-in | Q4 2026 |
| Data licensing | Aggregated / k-anonymized / synthetic datasets: €5K–50K/yr | Q1 2027 |
| CareerGraph Report | Quarterly AI labor transition insights: €199/qtr | Q2 2027 |

**Markets:**
- Career guidance platform market: $5.9B by 2034, 9.5% CAGR
- Workforce analytics market: $5.5B by 2030, 15.3% CAGR
- Alternative data market: $135B by 2030, 63% CAGR
- Germany public workforce spend: €16B+ annually (BA + BMBF + Jobcenter)

---

## Key Partners & Targets

| Partner | Role | Contact | Status |
|---------|------|---------|--------|
| Prof. Dr. Ursula Mense-Petermann, Bielefeld | Academic partner — Economic Sociology, AB10 | via Uni Bielefeld | Email ready |
| Arbeitsbereich 5, Bielefeld | Academic partner — Social Structure & Inequality | via Uni Bielefeld | Email ready |
| GRK 2951 Cross-Border Labour Markets | DFG research group, €6.7M 2024–2029 | via Uni Bielefeld | To explore |
| Deedy Das — Menlo Ventures / Anthology Fund | Lead investor target ($100K+) | via LinkedIn / email | Email ready |
| WZB Berlin | Backup academic partner | via wzb.eu | To explore |
| IAB Nürnberg | Backup academic partner — labor market research | via iab.de | To explore |

---

## Identified Risks

| Risk | Mitigation |
|------|-----------|
| GDPR Art. 9 special category data (health, family, migration) | DPIA is existential — start immediately after GmbH formation |
| "8 beta users" = problem validation, not product traction | Don't overclaim in outreach — be explicit about what the data is |
| No unit economics yet | Define CAC, LTV, conversion before Series A conversation |
| Single academic partner (Bielefeld) | Add WZB Berlin and IAB Nürnberg as backups |
| Anthropic RSP v3.0 softened safety pledge | Acknowledge proactively in investor materials |
| "Complement" not "layer" — Anthropic integration | Don't imply deeper Anthropic integration than exists |

---

## Tech Stack (planned)

- **AI:** Claude API — Sonnet 4.6 for guided interviews, Haiku 4.5 for classification
- **Backend:** Python/Django or Next.js (TBD)
- **Database:** PostgreSQL for structured career data
- **Occupation mapping:** O*NET API
- **Research data:** Anthropic Economic Index (public, HuggingFace)
- **Dev environment:** Linux Mint, PyCharm, Claude Code

---

## Quotes for Website

| Region | Quote |
|--------|-------|
| Europe | Kierkegaard: "Life can only be understood backwards; but it must be lived forwards." |
| Asia | Lao Tzu: "When I let go of what I am, I become what I might be." |
| Africa | Ugandan proverb: "The chameleon looks in all directions before moving." |
| North America | Maya Angelou: "There is no greater agony than bearing an untold story inside you." |
| South America | Paulo Coelho: "People are capable, at any time in their lives, of doing what they dream of." |
| Oceania | Aboriginal proverb: "We are all visitors to this time, this place. Our purpose here is to observe, to learn, to grow, to love — and then we return home." |

---

*This file is maintained as the single source of truth for the project. Claude Code should reference it when updating the homepage project section or writing outreach materials.*
