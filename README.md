# Devika Sakhuja — Website Redesign Proposal

A local, presentation-led proposal webpage prepared by Artworksit.

## Run locally

No dependency installation or build step is required. From the repository directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>.

You can also open `index.html` directly in a browser. For one self-contained file with all images, scripts and fonts embedded, open `standalone/Devika-Sakhuja-Proposal.html`.

## Edit and rebuild

- `index.html`: proposal copy and page structure.
- `style.css`: responsive layouts, typography and glass navigator.
- `script.js`: timeline, terms, section navigation and print behavior.
- `hero.js`: lakeside twilight-to-day scroll transition.
- `loader.js`: short arch reveal, skip and replay behavior.
- `gradient-wave.js`: section heading scroll reveal.
- `type-controls.js`: live Timeless typography controls and browser-local settings.
- `fonts.css` and `fonts/`: bundled variable fonts.

After editing, regenerate the self-contained file:

```sh
python3 scripts/build-standalone.py
```

The Typography button controls the hero heading, section headings and supporting typography. It includes Timeless Serif, Text, Sans and Grotesk cuts, variable weights, style and italic axes, letter spacing, line height and resets. Preferences are stored in the current browser; they do not modify the source files.

## Dependencies and assets

GSAP, ScrollTrigger and SplitText are bundled locally; their vendor files retain their original license notices. Timeless fonts are bundled with the full license in `fonts/Timeless-LICENSE.txt` and are used without modifying the font files. Imagery is included for this proposal.

All page behavior runs in the browser. No backend or deployment configuration is required.
