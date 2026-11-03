# Design principles (#212)

The rules that decide how ingré looks, sounds and moves. Anything built for the app has to be able to answer to them. The owner's decisions on #212 are the source; this file only organises them.

## Audience
People in their 20s to 40s who like cooking, do it by hand, and are short of time. What sets ingré apart is language anyone can read, across generations and languages.

## Language
- Plain, precise English that translates well. No culinary jargon by default.
- Optional tooltips explain a specialist or regional term (see `docs/TERMINOLOGY.md`). The tooltip is never the only place the meaning lives.
- One primary name per ingredient. Aliases exist for search only and are never shown as the name.
- Say what happens ("Add to list"), never how we feel about it ("Let's go!"). Australian English.
- Every string lives in `client/src/i18n/locales/en.json` and is read with `useT` or `translate`, so a new language is a new locale file and no code change.

## Motion
- Quiet service animations of about 500 ms with ease-out: things arrive and settle, like a waiter placing a plate. No bounce, no overshoot, nothing that loops.
- Reduced motion means instant: no transition, no animation. In Tailwind, pair every duration with `motion-reduce:duration-0 motion-reduce:transition-none`.
- Motion never carries information alone. A state change is also visible without it.
- Existing code uses 200 ms in `Collapse.tsx`. Move it to 500 ms when that file is next touched; do not change it as a drive-by.

## Aesthetic
- Ultra-modern and minimalist. The model is casual, one-Michelin-star precision with butler-style service: calm, exact, and never in the way.
- Quiet logo: smaller, with tighter tracking, than it is now.
- Few elements per screen, generous space, theme tokens only (no hex in components).
- Thumb zone first: the main actions sit in the bottom-right of a phone screen (see the bottom-right area, #210).

## Checklist for a change
1. Could a non-native English speaker read every string without a dictionary?
2. Does an ingredient show one name only?
3. Do new transitions take about 500 ms with ease-out, and stop under reduced motion?
4. Does it look the same with fewer decorations? If not, remove some.
5. Can it be reached with one thumb on a 390 px wide screen?
