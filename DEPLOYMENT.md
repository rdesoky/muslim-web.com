# Deployment / ops handoff — PHP-free static site

This document is the handoff for deploying the static site — either on
quran.muslim-web.com (nginx/Apache) or on GitHub Pages via the `gh-pages` branch.
See [GitHub Pages](#github-pages-gh-pages-branch) for the Pages setup.

## What changed

- `index.php`, `sura/index.php`, `exercise.php`, `filesver.php` and the legacy PHP apps
  (`facebook/`, `memorizer/`, `ie/`, `unused/`, `ie.php`, `reciter.php`, `js.php`,
  `qlib.php`, `strings.php`, `host_info.php`, `js_strings.php`, `tafseer.css.php`,
  `tafseer.css.pl`, `memorizer.php`) were **deleted**.
- Page shells are now static: `index.html`, `sura/index.html`.
- Localized strings are client-side: `js_strings_ar.js`, `js_strings_en.js`
  (generated from the former `ar_strings.php` / `en_strings.php`, which are deleted).
- qtext sura pages are static: `qtext/sura_001.html` … `qtext/sura_114.html`.
- Cache-busting `?v=` on css/js URLs and the `gBuildVer` tag are produced at build time
  by `tools/build/build_static.mjs`.
- **The Perl/CGI backend has been removed.** The former CGI endpoints
(`search.pl`, `get_aya_utf8.js.pl`, `get_aya_list_utf8.js.pl`, `get_sura_text.pl`,
`js_get_html.pl`, `getimg.pl`, `js_load.pl`, `js_load_utf8.pl`, `login.pl`,
`newuser.pl`, `loadmem.pl`, `savemem.pl`, `recite.pl`, `counter.js.pl`) are replaced
by client-side code in `js/quran/local_cgi.js`, which serves the same payloads from
`js/quran/qtext_data.js` (bundled Quran text + search) and local state.
- `cgi-bin/` and all other `.pl`/`.php` files have been deleted from the repo —
no server-side scripting remains.

## Build tooling (Node.js only)

The build/data tools are plain Node.js ES modules — **no Deno, TypeScript, or npm packages**
are required, only Node.js >= 18 (`node --version`):

| Tool | Purpose |
|---|---|
| `tools/build/build_static.mjs` | regenerates `js_strings_*.js` (if the PHP sources exist), stamps `?v=` and `gBuildVer` |
| `tools/build/build_qtext_data.mjs` | generates `js/quran/qtext_data.js` from `qtext/sura_*.html` |
| `tools/build/dump_qtext.mjs` | re-fetches the 114 static qtext sura pages from production |
| `tools/build/gen_tafseer.mjs` | downloads tafsir JSON into `tafseer/` |
| `tools/build/mirror_tafseer.mjs` | mirrors the tafseer/translation HTML pages into `tafseer/` (resumable) |
| `tools/build/test_local_cgi.mjs` | headless smoke test of `js/quran/local_cgi.js` (CI gate) |
| `tools/gh-pages/build_site.mjs` | assembles the publishable `_site/` tree for GitHub Pages |

All of them run from the repository root, e.g. `node tools/build/build_static.mjs`.

## Steps

1. **Remove PHP from the server.** Uninstall/disable mod_php / PHP-FPM for the vhost.
   The site has no PHP files left, so nothing should be routed through PHP.

2. **Deploy the static tree.** Copy the repo contents to the document root as before.
   There is no server-side scripting — every request is served as a static file.

3. **Run the build after each deploy** so cache-busting versions reflect the new files:

   ```sh
   cd <document root>
   node tools/build/build_static.mjs     # requires Node.js >= 18
   node tools/build/build_qtext_data.mjs # only when qtext/sura_*.html change
   ```

   This re-stamps `?v=` on css/js URLs and refreshes `gBuildVer` in `index.html` and
   `sura/index.html`. Skipping it risks stale cached assets.

4. **Serve static files with cache headers:**
   - CSS/JS/images: long cache (e.g. `max-age=604800`) — cache-busting happens via `?v=`.
   - `js_strings_ar.js` / `js_strings_en.js`: `max-age=7776000` (90 days), as the old
     `js_strings.php` did. They are versioned via `gBuildVer` in the pages.
   - HTML (`/`, `/sura/index.html`): `no-cache` (pages carry the current `?v=` stamps).

5. **Redirect old URLs to the static equivalents** (so old `?lang=`-style links keep working):
   - `/index.php` → `/`
   - `/sura/index.php` → `/sura/`
   - `/js_strings.php?lang=ar` → `/js_strings_ar.js`
   - `/js_strings.php?lang=en` → `/js_strings_en.js`
   - `/qtext/sura_NNN.php` → `/qtext/sura_NNN.html` (per sura, or a generic rewrite)
   These are one-line rewrites and are **optional** but recommended to keep bookmarked URLs alive.

## Language switching behavior

The pages read the `lang` cookie (default `ar`), and also honor a `?lang=ar|en` query
parameter (which sets the cookie for 5 years, matching the old PHP behavior). The language
switch control now sets the cookie client-side and reloads.

## Client-side data layer (formerly the CGI backend)

`js/quran/local_cgi.js` intercepts `LoadData`/`LoadJSON`/`ScriptLoader.loadJScript`/`openReciter`
and serves the following locally:

| Former CGI | Local replacement |
|---|---|
| `get_aya_utf8.js.pl` | random / by-position aya from `QuranTextData` |
| `get_aya_list_utf8.js.pl` | plain aya list for a page's `PageList` |
| `get_sura_text.pl` | range text/copy from `QuranTextData` |
| `search.pl` | substring search over normalized plain text (XML response) |
| `js_get_html.pl?/qtext/sura_NNN.html` | static qtext page body |
| `getimg.pl?/hpages/NNN.jpg` | direct static image (`/hpages/NNN.jpg`, `/pages/pNNN.gif`) |
| `js_load.pl` / `js_load_utf8.pl` | bypassed — data is produced in-page |
| `login.pl` / `newuser.pl` / `loadmem.pl` / `savemem.pl` | disabled stub (members migrate to Firebase) |
| `recite.pl` | range played through the mp3 `AudioPlayer` |
| `counter.js.pl` | ignored |

The Quran text dataset is `js/quran/qtext_data.js`, generated by
`tools/build/build_qtext_data.mjs` from the static `qtext/sura_*.html` pages
(`{sura:{aya:{t: display text, p: plain searchable text}}}`).

## Regenerating the qtext pages

The static sura pages (`qtext/sura_*.html`) are committed. If they must be refreshed from the
production-rendered pages, run:

```sh
node tools/build/dump_qtext.mjs   # from repo root; fetches http://quran.muslim-web.com/qtext/sura_NNN.php
```

`dump_qtext.mjs` extracts the `<body>` content and writes a clean UTF-8 static page for each
of the 114 surahs. (The upstream `.php` files are PHP-rendered; only their body content is used.)
## GitHub Pages (`gh-pages` branch)

The site is published as a **project page**:
<https://rdesoky.github.io/muslim-web.com/>

The live URL lives under a sub-path (`/muslim-web.com/`), which works because every page
references css/js/images with **relative** URLs. Keep it that way — root-absolute URLs
(`/css/...`) would break on Pages.

### How it is published

1. [`.github/workflows/deploy-gh-pages.yml`](.github/workflows/deploy-gh-pages.yml) runs on every
   push to `master` (and on manual *Run workflow*).
2. `node tools/build/build_static.mjs` re-stamps the `?v=` cache-busting versions and `gBuildVer`;
   `node tools/build/test_local_cgi.mjs` then smoke-tests the client-side CGI shim and fails the
   run if any endpoint check regresses.
3. `node tools/gh-pages/build_site.mjs --out _site` assembles the publishable tree and adds
   `.nojekyll` (without it Pages runs Jekyll, which drops files whose names start with `_`).
4. The workflow force-pushes `_site/` to the `gh-pages` branch. Each run rebuilds the whole
   tree, so the previous commit is replaced instead of stacked (keeps ~170 MB of images from
   piling up in history).

### One-time repository setting

The workflow only pushes the branch; Pages must be told to serve it. Either:

- **Settings → Pages → Source:** *Deploy from a branch*, **Branch:** `gh-pages`, **Folder:** `/ (root)`, or
- `gh api --method POST repos/rdesoky/muslim-web.com/pages -f 'source[branch]=gh-pages' -f 'source[path]=/'`
  (needs the `gh-pages` branch to exist — run the workflow once first).

### What is published

Everything in the working tree except build inputs and server leftovers:

| Excluded | Why |
|---|---|
| `.github/`, `.idea/`, `.vscode/`, `.gitignore` | CI / editor configuration |
| `tools/`, `cgi-bin/` | build scripts and legacy SQL dumps — must not be public |
| `.htaccess`, `x.htaccess`, `*.php`, `*.pl`, `*.sql`, `Thumbs.db`, `.DS_Store`, `Picasa.ini` | server-side / OS junk (Apache cache config is meaningless on Pages) |
| `DEPLOYMENT.md` | internal ops notes |
| `_site/` | build output |

### Deploying by hand (or to another host)

```sh
node tools/build/build_static.mjs      # requires Node.js >= 18
node tools/gh-pages/build_site.mjs     # writes _site/
```

Then publish `_site/` however you like, e.g.:

```sh
cd _site
git init -b gh-pages
git add -A
git commit -m "Deploy site"
git push --force https://github.com/rdesoky/muslim-web.com.git gh-pages
```

### Local preview

```sh
python -m http.server 8000 --directory _site
# http://localhost:8000/sura/index.html
```

To reproduce the project-site sub-path exactly (`…/muslim-web.com/`), mount `_site` one level
deep and browse the sub-directory:

```sh
mkdir -p /tmp/preview && ln -s "$PWD/_site" /tmp/preview/muslim-web.com
python -m http.server 8000 --directory /tmp/preview
# http://localhost:8000/muslim-web.com/
```

### Asset URLs must be relative (no leading `/`)

Project sites are served from `/<repo>/`, so a root-absolute URL such as `/hpages/001.jpg`
resolves to `https://<user>.github.io/hpages/001.jpg` and 404s. Every asset path in the app is
therefore built from `appBase()` — a helper in [`js/quran/lib.js`](js/quran/lib.js) that derives
the relative prefix back to the app root at runtime:

```js
// index.html   loads    "js/common/ScriptLoader.js"   -> appBase() === ""
// sura/index.html loads "../js/common/ScriptLoader.js" -> appBase() === "../"
var src = appBase() + "hpages/" + page + ".jpg";
```

It scans the document `<script src>` attributes for the first one containing `js/` and keeps
everything before it, so neither entry page has to declare a base URL. Because `lib.js` is loaded
by both pages before any consumer, `appBase()` is always available.

Rules for new code:

- Build asset paths as `appBase() + "<path from app root>"`; never hard-code `"/images/…"` or
  any other leading `/`.
- Do **not** reintroduce per-page base-URL globals. `gTafBase`, `gImgHost`, `gSuraTextHost`,
  `gAppRoot`, `gsAyatImageURL` and `gPagesServer` were all removed; each page used to declare
  its own copy (differing only by `""` vs `"../"`), which is exactly the duplication `appBase()`
  eliminates.
- Tafseer (commentary) pages live in the repo under `tafseer/` and are referenced relatively
  through `getTafseerPageURL(source, sura, aya)` in `js/quran/lib.js`. Do not point them at an
  external host — the former `https://tafseer.muslim-web.com/` base is gone. Note the on-disk
  layout is `tafseer/<SOURCE>/<SSS>/<SSSAAA>.html` (sura repeated in the filename), e.g.
  `tafseer/KATHEER/002/002255.html`, which is why the URL is not built inline.
- `tafseer/` holds **all ten** sources the `#SelTaf` dropdown offers: the four Arabic
  commentaries (`KATHEER`, `TABARY`, `GALALEEN`, `KORTOBY`) and the six translations
  (`en_yusufali`, `fr_hamidullah`, `de_bubenheim`, `tr_ozturk`, `id_muntakhab`, `ms_basmeih`).
  The whole tree is committed, so the site has no runtime dependency on the old host.
  Regenerate/extend it with [`tools/build/mirror_tafseer.mjs`](tools/build/mirror_tafseer.mjs):

  ```sh
  node tools/build/mirror_tafseer.mjs --dry-run      # report what is missing
  node tools/build/mirror_tafseer.mjs                # fill the gaps (resumable)
  node tools/build/mirror_tafseer.mjs --sources tr_ozturk --concurrency 4
  ```

  It only downloads files that do not exist yet, so it is safe to re-run. Remember that
  `.gitignore` contains `**/tafseer/*`: new pages need `git add -f tafseer`.
- The one intentional absolute base is the ayah preview image host
  (`www.elazhar.com/quran/image/`) — a third party with no local mirror. It is produced by
  `getAyaImageURL(nSura, nAya)` in `js/quran/qlib.js` rather than a global.

CSS is the exception: `url()` in a stylesheet resolves against the stylesheet, so
`css/quran/*.css` uses `url(../../images/…)`, which is depth-independent. Absolute `/cgi-bin/*`
strings are still safe because `js/quran/local_cgi.js` intercepts them before any request is
made. When adding an asset reference, run the local sub-path preview above before deploying.

### Differences from the nginx/Apache deployment

- No server-side redirects: the old `.php` URLs from step 5 above return 404 on Pages. Add
  small HTML redirect stubs if bookmarked `.php` links matter.
- No custom cache headers; Pages sets `Cache-Control: max-age=600` for everything, and the
  committed `?v=` stamps do the cache-busting instead.
- The custom domain `quran.muslim-web.com` is pinned by the committed [`CNAME`](CNAME) file at
  the repository root. `build_site.mjs` copies it into `_site/` and fails the build if it is
  missing, so every publish keeps the domain configured. DNS (`CNAME` record for `quran` →
  `rdesoky.github.io`) and the Pages custom-domain setting are one-time repository/DNS setup.
- Scripts, styles and the tafseer/translation corpora are now same-origin: the corpora live in
  `tafseer/` in this repo instead of a second host. Pages is HTTPS-only, so any `http://` asset is
  blocked as mixed content — that is why the old Flash badge (which pointed at `www.adobe.com`)
  and the Flash player paths were removed. Recitation audio is still streamed from
  `https://download.quranicaudio.com`, the only remaining off-origin dependency; keep new asset
  references relative and same-origin.
