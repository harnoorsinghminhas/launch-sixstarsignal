# Six Star Signal (sixstarsignal.com)

Static MVP served by GitHub Pages at https://sixstarsignal.com/. Est. 2026-10-03 (Harnoor, Telegram 19:16). A fan-made Grand Theft Auto VI news site.
Fan-made. Not affiliated with Rockstar Games or Take-Two Interactive. No build step, no dependencies, no secrets. The earlier rocket page is kept at
`/launching-soon.html` (noindex).

## Files
| File | What it is |
|---|---|
| `index.html` | Terms block, hero + sign-up (free fan preview only), "What we know / what's rumor" with sources, six-star wanted-level explainer, host quiz, this week's audio. |
| `assets/site.css`, `assets/site.js` | All styling and behaviour. Every DOM node is built with `textContent` (page runs under `require-trusted-types-for 'script'`). |
| `assets/logo.svg` | PLACEHOLDER text wordmark (the logo slot, see below). |
| `assets/icon.svg`, `assets/og.png` | Favicon and the 1200x630 link card. |
| `assets/audio/this-week-2026-10-03.mp3` | The sample (about 72 s), hosts Six (Gemini voice Kore) and Nitro (Puck). Script and voices in `F:/launch-pages/_gen/mvp_audio.py`; made with `gemini_audio_service.render_cached`. |
| `launching-soon.html`, `assets/style.css`, `assets/app.js` | The archived rocket page and its files. `_gen/build.py` still writes `style.css`/`app.js` but has `skip_index=True` for this key, so it never touches `index.html`, `404.html` or this README. |
| `CNAME`, `.nojekyll`, `robots.txt`, `sitemap.xml` | Pages plumbing. Do not delete `CNAME`. |

## Facts policy (nothing old, nothing unverified)
Every GTA fact on the page was re-checked on 2026-10-03 against a primary source, which is linked beside it: Rockstar's own game page and newswire, the Take-Two
announcement of 2026-06-24, Take-Two's earnings release of 2026-08-07, and Game Informer's 2026-09-29 cover story (labelled Reported). Dropped from the 09-02 concept
because it could not be confirmed today: the viewer-count record and the Rockstar character names. The wanted-level meter is an illustrative scale, not live data.
To update a fact: edit the `.facts` list in `index.html`, keep a source link and the label, and change the "checked" date.

## Logo slot (one place)
`index.html` has a single `<img class="logo" id="logo" src="assets/logo.svg" width="187" height="38">` (also in `404.html`). Replace `assets/logo.svg` with the real
logo under the same name, or change that one tag.

## Sign-up
POSTs `{email, hp, site: "sixstarsignal.com", landing_path, tz, query?}` to the Signal API `request-link`. CORS for this origin is already allowed. There are no paid plans here.
