#!/bin/sh
# #195: copies the client's recipe and ingredient JSON into a native app build.
# The single source is client/src/data/; the apps never keep their own copies, so this runs
# at build time (an Xcode build phase on iOS, a Gradle task on Android) and writes into the
# build output only. Usage: scripts/copy-native-data.sh <destination directory>
set -eu
if [ "$#" -ne 1 ]; then
  echo "usage: $0 <destination directory>" >&2
  exit 64
fi
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SRC="$ROOT/client/src/data"
DEST=$1
mkdir -p "$DEST"
for name in recipes.json ingredients.json; do
  if [ ! -f "$SRC/$name" ]; then
    echo "error: $SRC/$name is missing" >&2
    exit 66
  fi
  cp "$SRC/$name" "$DEST/$name"
done
echo "copied recipes.json and ingredients.json to $DEST"
