# Xuwen Zhang — GitHub Pages homepage

Static academic homepage migrated from the Google Sites site and styled after the minimal academic layout of Kewei Zhang's GitHub Pages homepage.

## Deploy

1. Put these files in the root of a GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the default branch (usually `main`) and `/ (root)`.

For a user site, name the repository `<github-username>.github.io`. For a project site, any repository name works.

## Files

- `index.html` — homepage
- `research.html` — research, publications, dissertations, service
- `talks.html` — talks grouped by topic, with expandable abstracts, related papers, and slides
- `talks.css`, `talk-slides.js` — Talks layout and inline PDF pagination
- `sheeting-theorem-slides.pdf` — slides for the sheeting theorem topic
- `capillary-varifolds-slides.pdf` — slides for the capillary surfaces and varifolds topic
- `bounding-area-prescribed-boundary-slides.pdf` — slides for the area bounds with prescribed boundary topic
- `willmore-inequalities-boundary-slides.pdf` — slides for the Willmore inequalities with boundary topic
- `alexandrov-capillary-cmc-abstract.pdf`, `alexandrov-capillary-cmc-slides.pdf` — abstract and slides for the Alexandrov-type theorem topic
- `pdfjs.mjs`, `pdfjs.worker.mjs`, `pdfjs-LICENSE.txt` — PDF.js 5.6.205 and its Apache 2.0 license
- `teaching.html` — teaching history
- `notes.html` — mathematical notes, organized by category
- `immersed-disk-triple-boundary.html` — an immersed disk example
- `central-patch.html` — parameter disk and interactive central-patch diagram
- `styles.css` — shared responsive styling
- `profile.jpg` — homepage portrait
- `.nojekyll` — serve files directly without Jekyll processing

## Migration note

The BV / finite-perimeter course remains hosted on the original Google Sites site and is linked from `teaching.html`.
