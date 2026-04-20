#!/usr/bin/env bash
# Compresses sewing images to web-ready sizes using macOS sips.
# Originals are renamed to *.orig as a backup.
# Safe to re-run — skips files that already have a .orig backup.

set -euo pipefail

SEWING_DIR="$(dirname "$0")/images/sewing"
MAX_PX=1200
QUALITY=85

find "$SEWING_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r img; do
  orig="${img}.orig"

  # Skip if already compressed (backup exists)
  if [[ -f "$orig" ]]; then
    echo "SKIP (already done): $img"
    continue
  fi

  # Backup original
  cp "$img" "$orig"

  # Resize and recompress in-place
  sips --resampleHeightWidthMax "$MAX_PX" \
       --setProperty formatOptions "$QUALITY" \
       "$img" > /dev/null

  orig_size=$(stat -f%z "$orig")
  new_size=$(stat -f%z "$img")
  pct=$(( (orig_size - new_size) * 100 / orig_size ))
  echo "OK  ${pct}% smaller: $(basename "$img")  ($(( orig_size / 1048576 ))MB → $(( new_size / 1024 ))KB)"
done

echo ""
echo "Done. To restore originals: find images/sewing -name '*.orig' | while read f; do mv \"\$f\" \"\${f%.orig}\"; done"
