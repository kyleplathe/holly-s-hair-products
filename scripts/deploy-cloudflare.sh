#!/usr/bin/env bash
# Publish the shop to Cloudflare Pages (a https://<project>.pages.dev URL).
# Requires a Cloudflare API token in CLOUDFLARE_API_TOKEN and the account id
# in CLOUDFLARE_ACCOUNT_ID. See the README. No payment secrets belong here.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/dist"
project="${CLOUDFLARE_PAGES_PROJECT:-hollys-hair-products}"

rm -rf "$dist"
mkdir -p "$dist/images" "$dist/fonts"
cp "$root/index.html" "$root/styles.css" "$root/site.js" "$root/pricing.js" "$root/app.js" "$root/.nojekyll" "$root/_headers" "$dist/"
cp "$root/images/"* "$dist/images/"
cp "$root/fonts/"*.woff2 "$root/fonts/"*.txt "$dist/fonts/"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Cloudflare is not logged in on this machine."
  echo "Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID, then run this script again."
  echo "The token needs the Cloudflare Pages permission to edit workers and pages."
  exit 1
fi

cd "$root"
npx --yes wrangler@4 pages deploy "$dist" --project-name "$project" --commit-dirty=true "$@"
