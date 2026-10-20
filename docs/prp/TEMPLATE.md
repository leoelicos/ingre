# PRP: <short title>

Read `AGENTS.md` first. Keep this brief; delete unused lines.

## User goal
As a <home cook / shopper>, I want <outcome> so that <reason>.

## Screen / route
- Route(s): `<e.g. /ingredients>` (see Routes in AGENTS.md)
- Component(s): `client/src/...`
- Server (if any): `server/src/schemas/...`, `server/src/datasources/...`

## Context files to read
- `AGENTS.md`
- `.cursor/context/<area>.md`
- `<specific source files>`

## Acceptance criteria (testable)
1. Given <state>, when <action>, then <visible result>.
2. ...
3. Works offline/on device where relevant (Saved stays on the device; no account needed).

## Out of scope
- <what not to touch>
- No new paid services or paid-tier dependencies (needs Alana's sign-off).

## Accessibility checks (WCAG 2.2 AA)
- [ ] Full flow works by keyboard only; focus visible and in a sensible order.
- [ ] VoiceOver reads every control's name and state.
- [ ] Buttons are real buttons with accessible names.
- [ ] Menus announce open/closed, close on Escape, arrow keys move between items.
- [ ] Colour is never the only cue; contrast passes AA.
- [ ] UI text is plain and literal (Australian English).
- [ ] `jest-axe` test added for new UI.

## Validation commands
```
cd client && npx tsc --noEmit && npm run lint -- --max-warnings 0 \
  && npx prettier --check "src/**/*.{ts,tsx,css}" && npm test -- --coverage && npm run build
cd ../server && npm test
```
Then: one PR for the batch, one review on the Vercel preview, owner merges.
