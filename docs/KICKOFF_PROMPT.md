# Kickoff prompt (paste this into Claude Code, in the empty repo)

```
Read CLAUDE.md first, then docs/GAME_RULES.md, docs/ARCHITECTURE.md and docs/ROADMAP.md.

Your job: complete milestones M0, M1, M2 and M3 from docs/ROADMAP.md, in order.
- Follow every rule in CLAUDE.md (pure engine, views without game logic, decisions already made).
- Tick the checkboxes in docs/ROADMAP.md as you finish each item.
- Use the branch and commit conventions from CLAUDE.md.
- After each milestone, run: npm run typecheck && npm run lint && npm run test && npm run build
- If something is unclear, choose the simplest option and add one line to docs/NOTES.md.
- Only stop to ask me if you are blocked by something I must provide (e.g. an API key).

When M3 is done, stop and give me a short summary: what you built, how to run it,
how you verified that switching 2D/3D mid-match does not desync the match, and what M4 will do.
```

## Follow-up prompts

After M3:
```
Good. Now do M4 (3D arena and animations) from docs/ROADMAP.md. Same rules as before. Stop at the end of M4 with a summary.
```

After M4:
```
Now do M5 (real data). I will put PSI_API_KEY in .env.local / Vercel. If you need anything from me, ask before continuing.
```

After M5:
```
Now do M6 (share screen) and M7 (ship). Stop at the end of M7 with the checklist of what I need to do manually (Vercel project, env var, domain, README GIF).
```
