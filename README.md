# Minimal GitHub Pages Blog (Welcome / Musings / Project History)

This repository is a small static scaffold intended for publishing via GitHub Pages.

Structure:

- `index.html` — Welcome page with links to recent musings
- `musings/index.html` — List of posts
- `musings/posts/*.html` — Individual posts (sample posts included)
- `projects/index.html` — Project history page
- `css/styles.css` — Minimal contemporary stylesheet

To publish on GitHub Pages:

1. Push this repository to GitHub (e.g. `origin/main`).
2. In the repository Settings > Pages, choose the `main` branch and `/ (root)` folder.
3. Save; the site will be available at `https://<your-username>.github.io/<repo>/` (or your custom domain).

How to add a new Musings post:

1. Create a new HTML file in `musings/posts/` named `post-slug.html`.
2. Add the content following the structure of the example posts.
3. Update `musings/index.html` and `index.html` to link to the new post (or use a tiny build script to automate this).

If you want automatic markdown → HTML builds or templating, I can add a small Node script (remark) or a Jekyll/_layouts setup — tell me which you prefer.
