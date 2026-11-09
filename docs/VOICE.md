# War room voice (#207)

Date: 10 Nov 2026 (AEDT). Box: 8-core x86 Linux, Node 22, Playwright Chromium 158 headless shell + Firefox 159.
Test audio: 10 English grocery phrases (Google TTS, en-AU voice) + 5 Japanese phrases (Google TTS ja),
resampled to 16 kHz mono. Synthetic voices, quiet room: **real phone mics, accents, kitchen noise are UNTESTED**.
Benchmarks were run outside the repo (Node with onnxruntime-node, and the browser WASM build driven by Playwright).

## Candidates

| Option | Licence | Download (first use) | Langs | Measured on box | Verdict |
|---|---|---|---|---|---|
| transformers.js 4.3.2 + **Moonshine tiny** (q8 ONNX) | Apache-2.0 lib, **MIT model** | model 28.2 MB (enc 7.9 + merged dec 20.3) + ORT wasm 4.7 MB compressed (26.9 MB raw) = **~33.5 MB over the wire**, 59 MB in Cache Storage | English only | Firefox 159 WASM: 87–382 ms/phrase, first load 11.7 s cold (download incl.), **1.65 s warm reload** from cache; Chromium WASM 117–201 ms/phrase. Node: 38–116 ms. 8/10 exact; "litre"→"leader/later", "almond meal"→"Armand meal" | **Chosen on-device engine for English** |
| transformers.js + Moonshine base (q8) | MIT | ~63 MB model | English | Node 46–200 ms; 8/10 ("plain flower", "liter") | Better on "almond meal", twice the size; not worth it for short phrases |
| transformers.js + Whisper tiny (q8) | MIT (OpenAI) / model card w/o licence tag on onnx-community | ~41 MB | 99 langs | Node 318–589 ms; **hallucinated a loop of "3.5.3…" for "three tins of chickpeas" (4.8 s)**, "Amen, male", "Playing flower" | Rejected for English |
| transformers.js + Whisper base (q8) | Apache-2.0 tag / MIT | ~77 MB | 99 langs | Node 531–903 ms; English 8/10 ok-ish; **Japanese 1/5** ("たまねぎ" for にんじん二本と玉ねぎ, "gunyu" for 牛乳) | Only multilingual MIT fallback; poor on short Japanese |
| Whisper tiny Japanese | MIT | ~41 MB | | Japanese 1/5 (牛乳 right, rest garbage) | Rejected |
| Moonshine tiny-ja (onnx-community/moonshine-tiny-ja-ONNX) | **Moonshine AI Community Licence** (free under US$1M revenue, not OSI) | ~28 MB | Japanese | **UNTESTED**: the ONNX export has no merged decoder, transformers.js 4.3.2 404s on `decoder_model_merged_quantized.onnx` | Promising but licence needs owner/finance sign-off; not shipped |
| whisper.cpp WASM (ggml tiny.en q5_1 32 MB, base q5_1 60 MB) | MIT | 32–60 MB + wasm | 99 langs | **UNTESTED** (no maintained npm build; same Whisper accuracy issues as above) | Rejected: more glue, same model family |
| vosk-browser 0.0.8 | Apache-2.0 | small-en-us 41 MB, small-ja 50 MB (zip) | en, ja, many | **UNTESTED**; npm package last published Dec 2022 | Rejected: unmaintained; kept as a Japanese fallback idea |
| Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) | browser built-in, free | 0 | all the browser's | Present in Chromium (no error in 5 s headless with fake mic, inconclusive); **absent in Firefox 159** (verified). Chrome sends audio to Google; Safari to Apple (or on-device on newer macOS/iOS) | Keep where present; auto-fall back to on-device on `network` / `service-not-allowed` / `language-not-supported` (Brave, Chromium without Google keys) |
| `@capacitor-community/speech-recognition` 7.0.1 | **MIT**, peer `@capacitor/core >=7` | 0 (uses OS recogniser) | OS languages | Read source: Android = `SpeechRecognizer` (Google/Samsung recognition service, partial results via `partialResults` event, no level events), iOS = `SFSpeechRecognizer` + `AVAudioEngine` (does **not** set `requiresOnDeviceRecognition`, so Apple may use its server). CocoaPods podspec only (client/ios uses a Podfile, OK) | **Chosen for the Capacitor Android/iOS apps** |
| `@capgo/capacitor-speech-recognition` 8.4.6 | MPL-2.0 | 0 | | not tried | Weak-copyleft; community plugin is enough |

Japanese via native/Web Speech: Android SpeechRecognizer, iOS SFSpeechRecognizer, Chrome and Safari Web Speech all support ja-JP (vendor docs, UNTESTED here).

## Memory / cold start

- Node rss with Moonshine tiny loaded: ~310–350 MB (process total incl. Node). Browser tab memory not measured precisely; Cache Storage holds 59 MB.
- Phones: **UNTESTED**. Expect several seconds for first wasm compile on mid-range Android; inference single-threaded unless the page is cross-origin isolated (ingre is not).

## Strategy (per platform)

1. **Capacitor Android / iOS apps** → native plugin (Android SpeechRecognizer, iOS SFSpeechRecognizer). Zero download, live interim text, follows ja-JP/en-AU. If the plugin says unavailable (no recognition service, e.g. de-Googled Android) → on-device model in the WebView (getUserMedia; RECORD_AUDIO declared).
2. **Chrome / Edge / Safari (desktop + mobile web)** → Web Speech. Instant, interim results, good Japanese. If it fails with a service error → switch to the on-device model automatically and say so.
3. **Firefox (desktop + Android) and anything without Web Speech** → on-device Moonshine tiny (English) / Whisper base (Japanese, flagged low accuracy) via transformers.js in a Web Worker; record with MediaRecorder, transcribe on stop, ~33.5 MB first-use download with progress, cached in Cache Storage (offline afterwards).
4. Keyboard dictation (Gboard, Win+H, Fn Fn) still works in the text field as last resort.

Why not the model everywhere: Moonshine is English-only under MIT; multilingual Whisper tiny/base were poor on short Japanese and Whisper tiny hallucinated on English; 33 MB first-use cost is unnecessary where the browser/OS already recognises speech for free.

## In the code

- `client/src/utils/voice/engine.ts` picks the engine (`chooseEngine`) and the fallback (`fallbackFor`); `speechLang` maps the app locale to `en-AU` / `ja-JP`.
- `speech.ts` (Web Speech), `native.ts` (Capacitor plugin), `onDevice.ts` + `model.ts` + `transcribe.worker.ts` (transformers.js in a Web Worker).
- `state.ts` is the button's reducer; `useVoiceCapture.ts` runs engines and falls back by itself.
- `client/src/pages/WarRoom/VoiceCapture.tsx` is the giant button: tap to start/stop, hold to talk, Alt+R anywhere, Escape stops; `aria-pressed`, a polite live status line, interim words, a level meter (on-device) or a pulse (motion-safe only).
- `client/src/utils/warroom/spoken.ts` turns recogniser text into the War room's typed form ("Two carrots." → "2 carrots", "flower" → "flour", "a litre of milk" finds milk by its last words).
- The ONNX Runtime wasm (27 MB, 6.8 MB gzipped) is bundled by Vite as a separate asset and only fetched by the worker; the model comes from huggingface.co on first use and is kept in Cache Storage.
- Android: `RECORD_AUDIO` + `MODIFY_AUDIO_SETTINGS` in the manifest. iOS: `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription`.

## Not tested on real devices yet

Real phones (Android Capacitor app, iOS Capacitor app, Android Chrome, iOS Safari), real microphones and accents, kitchen noise,
phone memory and cold start for the on-device model, Samsung's recognition service, Japanese anywhere outside the synthetic clips above.
