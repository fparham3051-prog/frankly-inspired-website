#!/usr/bin/env bash
# Publishes the built Astro site to the Render service that franklyinspired.associates
# is attached to.
#
# Why this exists: the custom domain is on the original Render static site
# ("frankly-inspired-website"), which serves the folder "frankly-inspired-website 2"
# from the `main` branch with no build step. The Astro site builds from
# `astro-rebuild` on a separate service. Until that original service's settings
# are switched to build Astro itself (Render dashboard > frankly-inspired-website >
# Settings: Branch astro-rebuild, Build Command "npm install && npm run build",
# Publish Directory "dist"), this runs automatically on every push to
# astro-rebuild (.github/workflows/publish-to-domain.yml). Run it by hand
# only if that workflow is disabled.
#
# Usage: scripts/publish-to-domain.sh   (from the repo root, on astro-rebuild)
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
SRC_SHA="$(git rev-parse --short HEAD)"
npm run build
WT="$(mktemp -d)"
git fetch -q origin main
git worktree add -q "$WT" origin/main
trap 'git worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT
cd "$WT"
git checkout -q -B main origin/main
OUT="frankly-inspired-website 2"
git rm -rq --ignore-unmatch -- "$OUT"
rm -rf -- "$OUT"
mkdir -p -- "$OUT"
cp -R "$ROOT/dist/." "$OUT/"

# Old .html addresses from the original site -> new pages, so existing
# links, bookmarks, and search results keep working.
# Targets end in "/" so they always resolve to the page's folder
# (about/index.html), never back to this stub, whatever extension rules the
# host applies.
redirect() {  # $1 = old file, $2 = new path
  set -- "$1" "$2/"
  cat > "$OUT/$1" <<HTML
<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Moved</title><meta name="robots" content="noindex">
<link rel="canonical" href="https://franklyinspired.associates$2">
<meta http-equiv="refresh" content="0; url=$2">
<script>location.replace("$2" + location.hash);</script>
</head><body><p>This page has moved to <a href="$2">$2</a>.</p></body></html>
HTML
}
redirect about.html /about
redirect assessment.html /assessment
redirect financial-health.html /revenue-growth-score
redirect revenue-growth-score.html /revenue-growth-score
redirect leadership-health.html /leadership-health
redirect sustainability-score.html /sustainability-score
redirect privacy.html /privacy
redirect terms.html /terms
redirect institutional-advancement-score.html /institutional-advancement-score
redirect institutionalos.html /institutionalos

cat > "$OUT/README.md" <<MD
Built output of the Astro site (branch astro-rebuild, commit $SRC_SHA).
Do not edit here; edit astro-rebuild and run scripts/publish-to-domain.sh.
MD
git add -A -- "$OUT"
if git diff --cached --quiet; then echo "No changes to publish."; exit 0; fi
git commit -qm "Publish Astro site ($SRC_SHA) to the domain's Render service" ${PUBLISH_TRAILER:+-m "$PUBLISH_TRAILER"}
git push -q origin main
echo "Published $SRC_SHA to main. Render deploys the 'frankly-inspired-website' service automatically."
