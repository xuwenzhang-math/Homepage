# Xuwen Zhang — GitHub Pages homepage

Static academic homepage migrated from the Google Sites site and styled after the minimal academic layout of Kewei Zhang's GitHub Pages homepage.

## Deploy

1. Put these files in the root of a GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the default branch (usually `main`) and `/ (root)`.

For a user site, name the repository `<github-username>.github.io`. For a project site, any repository name works.

## Files

- `index.html` — homepage
- `research.html` — research, publications, talks, dissertations, service
- `teaching.html` — teaching history
- `bv-course.html` — BV / finite-perimeter course page
- `styles.css` — shared responsive styling
- `.nojekyll` — serve files directly without Jekyll processing

## Migration note

The original Google Sites portrait is currently referenced by its public Googleusercontent URL so the visible image remains the same. For maximum long-term independence, download your own portrait into the repository (for example `assets/profile.jpg`) and replace the `src` in `index.html`.
