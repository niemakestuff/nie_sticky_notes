#!/usr/bin/env bash
set -euo pipefail

# Tags a commit and creates a draft GitHub release with the built exe.
# Review and publish it from the GitHub releases page.
#
# Usage: ./release.sh <version> <commit> [--notes <file>]
#   version   Release version, e.g. 1.0.0 (tag becomes v1.0.0)
#   commit    Commit to tag (required, so HEAD never gets tagged by accident)
#   --notes   Markdown file with release notes (default: gh generates from commits)

cd "$(dirname "$0")"

usage() { sed -n '4,10p' "$0"; exit 1; }

VERSION=""
COMMIT=""
NOTES=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --notes) NOTES="${2:?--notes needs a file}"; shift 2 ;;
        -h|--help) usage ;;
        -*) echo "Unknown flag: $1"; usage ;;
        *)
            if [[ -z "$VERSION" ]]; then VERSION="$1"
            else COMMIT="$1"
            fi
            shift ;;
    esac
done

[[ -n "$VERSION" && -n "$COMMIT" ]] || usage
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.]+)?$ ]] \
    || { echo "Version doesn't look like semver: $VERSION"; exit 1; }

TAG="v$VERSION"
EXE="src-tauri/target/release/nie_sticky_notes.exe"
ASSET="nie_sticky_notes_${VERSION}_windows_x64.exe"

# --- Sanity checks ----------------------------------------------------------

git rev-parse --verify --quiet "$COMMIT^{commit}" >/dev/null \
    || { echo "No such commit: $COMMIT"; exit 1; }

git rev-parse --verify --quiet "refs/tags/$TAG" >/dev/null \
    && { echo "Tag $TAG already exists"; exit 1; }

# The three version declarations must agree with the one being released
grep -q "\"version\": \"$VERSION\"" package.json \
    || { echo "package.json version != $VERSION"; exit 1; }
grep -q "\"version\": \"$VERSION\"" src-tauri/tauri.conf.json \
    || { echo "tauri.conf.json version != $VERSION"; exit 1; }
grep -q "^version = \"$VERSION\"" src-tauri/Cargo.toml \
    || { echo "Cargo.toml version != $VERSION"; exit 1; }

[[ -f "$EXE" ]] || { echo "Missing $EXE — run: pnpm tauri build --no-bundle"; exit 1; }

# A binary older than the commit it claims to release is a forgotten rebuild
exe_time=$(stat -c %Y "$EXE")
commit_time=$(git log -1 --format=%ct "$COMMIT")
(( exe_time > commit_time )) \
    || { echo "$EXE predates $COMMIT — run: pnpm tauri build --no-bundle"; exit 1; }

# From WSL, also compare the version embedded in the exe's metadata
if command -v wslpath >/dev/null && command -v powershell.exe >/dev/null; then
    exe_version=$(powershell.exe -NoProfile -Command \
        "(Get-Item '$(wslpath -w "$EXE")').VersionInfo.ProductVersion" | tr -d '\r')
    [[ "$exe_version" == "$VERSION" ]] \
        || { echo "exe metadata says $exe_version, releasing $VERSION — rebuild"; exit 1; }
fi
[[ -z "$NOTES" || -f "$NOTES" ]] || { echo "Notes file not found: $NOTES"; exit 1; }

gh auth status >/dev/null || exit 1

# --- Confirm ----------------------------------------------------------------

echo "Release:  Nie Sticky Notes $VERSION"
echo "Tag:      $TAG -> $(git log -1 --oneline "$COMMIT")"
echo "Artifact: $ASSET ($(du -h "$EXE" | cut -f1))"
echo "Notes:    ${NOTES:-generated from commits}  [draft]"
read -r -p "Continue? [y/N] " answer
[[ "$answer" == [yY]* ]] || exit 1

# --- Do it ------------------------------------------------------------------

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
cp "$EXE" "$workdir/$ASSET"

git tag "$TAG" "$COMMIT"
git push origin "$TAG"

notes_args=(--generate-notes)
[[ -n "$NOTES" ]] && notes_args=(--notes-file "$NOTES")

gh release create "$TAG" "$workdir/$ASSET" \
    --title "Nie Sticky Notes $VERSION" \
    "${notes_args[@]}" \
    --draft

echo "Draft created: $(gh release view "$TAG" --json url --jq .url)"
