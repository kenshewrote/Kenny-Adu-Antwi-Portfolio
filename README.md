# Kenny Adu Antwi · Checkpoint Journey portfolio

Plain HTML/CSS/JS. No build step.

```
index.html                  page shell
js/config.js                ALL editable text: name, speech lines, projects, research, awards, goals, links
js/main.js                  journey engine (scroll snap, running, parallax, sprites, effects, pop-ups)
css/style.css               theme + layout
assets/character/           sprite PNGs (originals) + webp/ (compressed, used by the site)
assets/img/projects/        compressed project screenshots
kenny_adu_antwi_resume.pdf  resume linked from the site
_source/, tools/            original images + optimizer script (not deployed, see .vercelignore)
```

## Preview locally

```
cd Portifoli_website
python -m http.server 8000
```

Then open http://localhost:8000

## Deploy on Vercel

Deploy with the Vercel CLI from this folder. The resume and personal photos are in `.gitignore`
(kept off GitHub), so a GitHub-linked Vercel deploy would be missing them; the CLI uploads
everything except what `.vercelignore` lists.
```
npm i -g vercel
vercel          # first time: log in and link/create the project
vercel --prod
```

Not in the GitHub repo (see `.gitignore`): `kenny_adu_antwi_resume.pdf`, `_source/`,
`assets/img/profile.webp`, `assets/img/awards/`, `assets/img/art/`.

## Editing

- Guide name: `characterName` in `js/config.js`. Speech lines: `speech` (`{name}` = the character name).
- Anything written as `[LIKE THIS]` is a placeholder (dashed orange outline).
  Fill it in, or set `showPlaceholders: false` to hide every unfilled one.

## Look, sky life, and sound

- `css/theme.css`: the retro-future glass theme. Change `--glass` (tint) and `--glass-blur` at the top to make panels more or less see-through.
- Background (synthwave): drawn in code in `paintScenery()` / `drawFloor()` in `js/main.js`
  (cloud streaks, neon city, faceted mountains, glass pyramids, striped sun, perspective grid floor).
  Sky colours per stop are `sky` in `js/config.js`.
- `js/ambient.js`: pixel birds, spaceship vs. asteroid, stars. Turn pieces on/off with `retro` in `js/config.js`.
- `js/sound.js`: run sound, checkpoint chime, finish fanfare. Settings are `sound` in `js/config.js`.
  The run sound is `assets/sound/run.mp3` (`runSound`, played once each time Kenny starts running;
  `runVolume` sets its loudness). Set `runSound: null` to go back to chiptune footsteps.
  Browsers only play sound after a click, tap, or key press, so the speaker button pulses until then.

## Beyond Code (checkpoint 5)

`beyond` in `js/config.js`, with tabs Soccer, Anime, Games, Art, Editing, Clubs.
- The Chelsea photo (2012 Champions League parade) is from Wikimedia Commons, CC BY 2.0; keep its credit line.
- Anime and game cards use small cover images from Wikipedia (copyrighted art, shown as fan references).
  Swap any `image` for your own; set it to `null` to get a drawn pixel cover instead.
- Art: put each piece in `_source/beyond/`, save a .webp to `assets/img/beyond/`, and add
  `{ image: "assets/img/beyond/art-1.webp", title: "..." }` to `art.pieces`. Clicking a piece opens it full size.

## Adding photos (awards, research, new projects)

1. Put the original photo in `_source/projects/` (e.g. `_source/projects/poster-award.jpg`).
2. Run `python tools/optimize_images.py`. It writes `assets/img/projects/poster-award.webp`.
3. In `js/config.js`, set that item's `image` to `"assets/img/projects/poster-award.webp"`.
   - Research items and projects show it on the card and in the pop-up.
   - Awards show it on the badge, with a "View photo" pop-up.

## Checkpoint pop-ups

When Kenny reaches a checkpoint its pop-up opens and scrolling (wheel, touch, arrow keys) only scrolls the pop-up.
Close (or Esc) hands scrolling back to the run; "Open …" brings the pop-up back. The dots at the top always work.
Kenny's line after closing is `speech.closed` in `js/config.js`.
