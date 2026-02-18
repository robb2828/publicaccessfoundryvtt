#!/usr/bin/env bash
# Build a zip for GitHub Release. Run from repo root.
# Usage: ./build-release.sh [version]
# Example: ./build-release.sh 0.1.0
# Creates: publicaccessfoundryvtt.zip with system.json, module/, styles/, lang/, packs/ at root.

set -e
VERSION="${1:-0.1.0}"
ZIPNAME="publicaccessfoundryvtt.zip"
echo "Building $ZIPNAME for version $VERSION..."

# Remove old zip if present
rm -f "$ZIPNAME"

# Zip contents must have system.json at root (Foundry requirement).
zip -r "$ZIPNAME" system.json module styles lang
[ -d packs ] && zip -r "$ZIPNAME" packs

echo "Created $ZIPNAME"
echo "Next: Create a GitHub Release with tag v$VERSION and upload $ZIPNAME as an asset."
