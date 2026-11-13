# Devika Sakhuja — Website Redesign Proposal

A local proposal webpage prepared by ArtWorksIT. No framework, backend, installation or deployment is required to view it.

## Run locally

From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>. You can also open `index.html` directly, or use the self-contained HTML in `standalone/`.

## Source and rebuild

- `index.html`: all ten sections, including the timeline and terms, plus social metadata, structured data and the analytics tag.
- `style.css`: consolidated responsive styles for the current design and print view.
- `script.js`: navigation, print handling and the scroll-driven photo stack.
- `hero.js`, `loader.js`, `gradient-wave.js`: active hero, arch loader and heading animations.
- `fonts.css`, `fonts/`: the full Timeless variable family and license.
- `*.webp`: optimized photographs, agency mark and supplied signature.
- `og-image.jpg`: 1200 × 630 social sharing artwork.
- `scripts/build-standalone.py`: generates the portable HTML using only Python's standard library.
- `scripts/check.py`: verifies anchors, local assets, metadata, structured data and analytics in both versions.

After editing:

```sh
python3 scripts/build-standalone.py
python3 scripts/check.py
```

The current typography is fixed in the `:root` variables in `style.css`. There is no editing panel, settings persistence or alternate-theme switch.

Keep vendor scripts unchanged; they retain their license notices. All font variations remain available. Image crops fill the scroll gallery; reduced-motion mode shows a static gallery instead.

## Sharing and analytics

Open Graph and Twitter metadata use the public repository's raw `og-image.jpg` URL so the image is addressable without deploying this page. A canonical URL and `og:url` are intentionally omitted because no public page URL has been assigned. If the page is later hosted, point those tags and the image metadata at its actual public domain.

The requested deferred analytics tag uses `analytics.artworksit.com` with website ID `0e8f7c25-c8f2-441e-a51a-011ba5fe3da7`. The standalone version retains that remote tag; the remaining page assets are embedded.

The footer follows the Rassaz proposal's dark treatment, agency details, supplied signature and oversized ArtWorksIT wordmark while preserving Timeless typography.
