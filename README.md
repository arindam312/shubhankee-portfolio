# Shubhankee Raha — Portfolio

Personal portfolio of **Shubhankee Raha**, PR & Strategic Communications professional.

A fast, dependency-free static website (HTML + CSS + vanilla JS) — no build step, hosts free on GitHub Pages.

## Structure

```
index.html                  ← all page content (About, Experience, Work, Services, Contact)
assets/
  css/styles.css            ← design system & layout
  js/press-releases.js      ← ✏️  press releases data — edit this to add releases
  js/main.js                ← interactions (menu, filters, search, animations)
  img/                      ← images (add your portrait as shubhankee.jpg)
  press/                    ← (optional) put press release PDFs here
```

## Common edits

### Add your photo
Save a portrait as `assets/img/shubhankee.jpg` (portrait orientation, ~1200px tall works well). It replaces the fallback hero image automatically.

### Add a press release
Open `assets/js/press-releases.js` and add a block:

```js
{
  title: "Headline of the release",
  date: "2025-06-14",
  location: "Visakhapatnam",
  category: "Healthcare",
  org: "Andhra Pradesh MedTech Zone (AMTZ)",
  summary: "One or two sentences on what it announced.",
  link: "https://link-to-published-release-or-coverage"   // or "assets/press/file.pdf"
},
```

Remove the `sample: true` entries once real releases are added. Categories appear as filter tabs automatically.

### Update experience / text
Edit the relevant section directly in `index.html` — each section is clearly labelled with a comment.

## Preview locally
Just open `index.html` in a browser.

## Publish with GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
The site will be live at `https://<username>.github.io/<repo-name>/` within a minute or two.
