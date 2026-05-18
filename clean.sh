#!/usr/bin/env bash
set -euo pipefail

# Укажите ВАШИ имя и email
TARGET_NAME="AinorRikar"
TARGET_EMAIL="ainorrikar@gmail.com"

# Данные, которые нужно найти и заменить (можно оставить по умолчанию)
CURSOR_EMAILS="${CURSOR_EMAILS:-cursoragent@users.noreply.github.com,cursoragent@cursor.com}"
CURSOR_NAMES="${CURSOR_NAMES:-cursoragent,Cursor Agent,Cursoragent}"
CURSOR_SUBSTRINGS="${CURSOR_SUBSTRINGS:-cursoragent,cursor agent,@cursor.com}"

REPO_URL="${1:-}"
TARGET_NAME="${TARGET_NAME:-$(git config --global --get user.name || true)}"
TARGET_EMAIL="${TARGET_EMAIL:-$(git config --global --get user.email || true)}"
WORKDIR="${WORKDIR:-/tmp/repo-clean-$$.git}"

if [[ -z "$REPO_URL" ]]; then
  echo "ERROR: Missing repository URL."
  echo "Example: $0 git@github.com:USER/REPO.git"
  exit 1
fi

if [[ -z "$TARGET_NAME" || -z "$TARGET_EMAIL" ]]; then
  echo "ERROR: TARGET_NAME and TARGET_EMAIL must be set."
  exit 1
fi

if ! git filter-repo -h >/dev/null 2>&1; then
  echo "ERROR: git-filter-repo is not installed. Install it with:"
  echo "  pipx install git-filter-repo"
  echo "  OR brew install git-filter-repo"
  exit 1
fi

echo "Cloning bare repository..."
git clone --bare "$REPO_URL" "$WORKDIR"
cd "$WORKDIR"

echo "Rewriting author names and emails..."
git filter-repo --name-callback '
  if name in os.environ.get("CURSOR_NAMES", "").split(","):
    return os.environ["TARGET_NAME"]
  return name
' --email-callback '
  if email in os.environ.get("CURSOR_EMAILS", "").split(","):
    return os.environ["TARGET_EMAIL"]
  return email
' --message-callback '
  import re
  msg = message.decode("utf-8")
  for sub in os.environ.get("CURSOR_SUBSTRINGS", "").split(","):
    msg = re.sub(re.escape(sub), "", msg, flags=re.IGNORECASE)
  # Удаление трейлера Co-authored-by
  msg = re.sub(r"^Co-authored-by:.*$", "", msg, flags=re.MULTILINE)
  return msg.encode("utf-8")
'

echo "Pushing cleaned history..."
git push origin --force --all
git push origin --force --tags

echo "Cleanup complete."
cd ..
rm -rf "$WORKDIR"
