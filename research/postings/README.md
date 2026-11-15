# Job postings behind the routes

One CSV per route, `<route-id>.csv`: the entry-level listings it was checked
against, one row each, tagged with the Terminus stops each listing asks for.
`npm run evidence -- <route-id>` turns a file into shares per stop.

## November 2026: 25 routes, 749 listings

- **Where:** Naukri, India, searched with the experience filter at 0 years, on 9 November 2026. The search term is the route's usual title ("data analyst", "devops engineer", "soc analyst" for the security analyst route, "application support engineer" for support).
- **Which listings:** the first 30 results, skipping repeats of the same title at the same company. Ranking is Naukri's, so sponsored listings and large employers are over-represented.
- **How they were tagged:** each listing was opened and its key skills and description were matched against a fixed list of phrases for every stop ("Power BI", "Tableau" or "Looker" count as BI tools; "SIEM", "SOC" or "incident response" as threat detection). The phrase list is `phrases-2026-11.json` (regular expressions per stop) and is deliberately strict for vague words: "API", "reports" or "cloud" only count when they're listed as a key skill, not when they appear in the company blurb. Descriptions themselves were not copied.
- **What was thrown out:** the VLSI search returned mostly unrelated engineering jobs, so it isn't used. A "consulting" phrase matched company names rather than skills, so it was removed from every file. In the electrical and embedded files, "transformer" means the machine, not the AI model.
- **Limits:** a listing that doesn't name a skill may still test it (data structures in SDE interviews are the usual example), and 30 listings is a sample, not a census. Where a route keeps a stop against the numbers, its `evidence.note` in `content/roles.yaml` says why.

The earlier card-level counts are in `naukri-2026-11.md`.

## November 2026, batch 2: 24 routes, 644 listings

Same search, same order and the same rule of opening each listing, with three differences.

- **Only relevant listings count.** Naukri pads thin searches with unrelated jobs (an ASP.NET internship under "ServiceNow developer"), so a listing only counts if its title or key skills match the role. A route needs at least 20 such listings to leave draft; most have 30.
- **Thin markets go up to 2 years.** Where 0 years' experience gave too few relevant listings, the search was widened to Naukri's "1 year" filter, which returns roles open to 0–2 years. Those routes say "India, 0–2 years", and their notes say how many listings came from the wider search. Two routes also searched a common alternative title: "UiPath developer" for RPA and "RF engineer" for telecom.
- **Phrase list version b.** `phrases-2026-11b.json` adds phrases for 44 stops these routes use, and removes matches that turned out to be noise: "consulting" (every Naukri page footer says "IT Services & Consulting"), "ledger" in blockchain listings, "transformers" in machine-learning listings, "budget" and "forecast" as key skills, and the C in "Objective C". The page footer (role, industry, department) is no longer read at all. The first 25 routes were tagged with version a and are unchanged.

Mainframe developer stays a draft: neither "mainframe developer" nor "COBOL developer" returned 20 relevant entry-level listings. Indian freshers mostly reach mainframe work through employers' trainee programmes, which aren't posted under that title.

## November 2026, deep career paths

Some routes are second jobs, not first ones, and India has too few listings for them on Naukri. For these the plan is: search Naukri first, and only if it has fewer than 20 relevant listings at any level, use companies' own job boards worldwide, and say so on the route.

- **Where:** the public Greenhouse and Ashby job boards of AI and infrastructure companies, read on 15 November 2026. These are the companies' own listings with full descriptions.
- **Which listings:** every engineering listing whose title names the specialism, at most five per company so one large employer doesn't dominate, skipping managers, product, sales and support roles, and repeats of one role in several cities.
- **How they were tagged:** these listings have no separate key-skills field, so only the "anywhere" phrases are used, on the title and full description. `phrases-2026-11c.json` adds phrases these listings use (NCCL, KV cache, RDMA, torch.compile) and drops version-b phrases that matched company blurbs instead of skills ("valuation", "recruitment", "networking opportunities", ".NET" in cluster names).
- **Labelling:** the route's region says "Global" and how senior the listings are, and its note says why India wasn't used.

**AI inference engineer (52 listings, 19 companies).** Naukri, searched for "inference engineer" at every experience level, returned one real inference role (Persistent, 5–10 years); the rest were MLOps and general AI listings. The global sample has one listing in India (Sarvam, Bengaluru). 34 of the 52 are senior or staff.

**Agentic AI engineer (26 listings, India, entry level).** Naukri, 0 years, searched for "agentic AI engineer" (7 pages) and "AI agent developer" (2 pages). All 159 listings were opened; 26 counted, because only those had agents in the title or key skills and were engineering roles. Sales, teaching, testing, senior and staff roles were left out. Version c of the phrase list adds an "AI agents" set (agentic, LangGraph, CrewAI, AutoGen, tool calling, MCP) and counts "LLM" under LLM APIs rather than under transformers.

**Harness engineer: no route.** Across 4,129 open listings on the job boards of 23 AI companies (OpenAI, Anthropic, Cognition, Cursor, Replit, Perplexity, Cohere and others) on 15 November 2026, one title used the word "harness", and it was a product manager. It isn't a job title yet, so its topics went into the AI agents stop instead.
