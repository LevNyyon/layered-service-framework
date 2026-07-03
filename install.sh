#!/usr/bin/env bash
# Nyyon Lite installer. Installs the skill and links the /nyyon-* commands.
#
# Works with the plugin-compatible repo layout: the same repo is BOTH a
# standalone skill (this curl|bash / git-clone path, bare /nyyon-* commands)
# AND a Claude Code plugin (.claude-plugin/plugin.json + marketplace.json).
# This installer only drives the standalone path and ignores .claude-plugin/.
#
# It clones the repo to a source checkout, then exposes the skill directory
# (wherever SKILL.md lives in the repo: the root, or skills/nyyon-lite/) at
# ~/.claude/skills/nyyon-lite, and links every commands/*.md into
# ~/.claude/commands. Re-running clones or fast-forwards, then re-links.
#
# Overrides:
#   NYYON_LITE_REPO      git URL to clone from
#   NYYON_LITE_SRC       where the repo is cloned/updated (source of truth)
#   NYYON_LITE_DIR       where the skill is exposed to Claude Code
#   NYYON_LITE_CMDDIR    where the /nyyon-* commands are linked
set -euo pipefail

REPO="${NYYON_LITE_REPO:-https://github.com/LevNyyon/nyyon-lite.git}"
SRC="${NYYON_LITE_SRC:-$HOME/.claude/skills/nyyon-lite-src}"
SKILL_DIR="${NYYON_LITE_DIR:-$HOME/.claude/skills/nyyon-lite}"
CMDDIR="${NYYON_LITE_CMDDIR:-$HOME/.claude/commands}"

# 1. Clone the repo, or fast-forward it if already present.
if [ -d "$SRC/.git" ]; then
  echo "Updating nyyon-lite at $SRC"
  git -C "$SRC" pull --ff-only
else
  echo "Cloning nyyon-lite into $SRC"
  mkdir -p "$(dirname "$SRC")"
  git clone --depth 1 "$REPO" "$SRC"
fi

# 2. Find SKILL.md inside the checkout. The plugin layout allows it at the repo
#    root or under skills/nyyon-lite/. SKILL_SRC = the directory holding it.
if [ -f "$SRC/SKILL.md" ]; then
  SKILL_SRC="$SRC"
elif [ -f "$SRC/skills/nyyon-lite/SKILL.md" ]; then
  SKILL_SRC="$SRC/skills/nyyon-lite"
else
  found="$(find "$SRC" -maxdepth 3 -name SKILL.md -print -quit 2>/dev/null || true)"
  SKILL_SRC="${found:+$(dirname "$found")}"
  if [ -z "$SKILL_SRC" ] || [ ! -f "$SKILL_SRC/SKILL.md" ]; then
    echo "error: could not find SKILL.md inside $SRC" >&2
    exit 1
  fi
fi

# 3. Expose the skill at SKILL_DIR pointing at the directory that holds
#    SKILL.md. If SKILL.md is already at the checkout root and SKILL_DIR would
#    just re-point at that same root, skip the link (nothing to do).
if [ "$SKILL_DIR" = "$SKILL_SRC" ]; then
  echo "Skill in place at $SKILL_DIR"
else
  mkdir -p "$(dirname "$SKILL_DIR")"
  # Replace any prior symlink/file/dir at SKILL_DIR (but never the checkout).
  if [ "$SKILL_DIR" != "$SRC" ] && { [ -L "$SKILL_DIR" ] || [ -e "$SKILL_DIR" ]; }; then
    rm -rf "$SKILL_DIR"
  fi
  ln -sfn "$SKILL_SRC" "$SKILL_DIR"
  echo "Linked skill $SKILL_DIR -> $SKILL_SRC"
fi

# 4. Link every command file into CMDDIR (bare /nyyon-* commands).
CMD_SRC="$SRC/commands"
if [ -d "$CMD_SRC" ]; then
  mkdir -p "$CMDDIR"
  linked=0
  for cmd in "$CMD_SRC"/*.md; do
    [ -e "$cmd" ] || continue
    ln -sfn "$cmd" "$CMDDIR/$(basename "$cmd")"
    linked=$((linked + 1))
  done
  echo "Linked $linked command file(s) into $CMDDIR"
else
  echo "warning: no commands/ directory at $CMD_SRC" >&2
fi

echo
echo "Nyyon Lite installed."
echo "  source:   $SRC"
echo "  skill:    $SKILL_DIR"
echo "  commands: $CMDDIR (/nyyon-gateways, /nyyon-tools, /nyyon-workflows, /nyyon-modules, /nyyon-surfaces, /nyyon-knowledge)"