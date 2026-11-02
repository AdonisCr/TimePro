#!/usr/bin/env bash
# Lance les tests PHPUnit de Time Pro.
#
# Sur certaines machines, l'extension PHP "pdo_sqlite" (utilisee par les tests
# en memoire) n'est pas installee. Ce script la charge alors depuis
# Backend/.php-ext/ sans modifier la configuration systeme.
#
# Usage : ./scripts/test.sh [options phpunit]

set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$BACKEND_DIR/.php-ext"

if php -m | grep -qi '^pdo_sqlite$'; then
  exec php "$BACKEND_DIR/artisan" test "$@"
fi

if [ ! -f "$EXT_DIR/pdo_sqlite.so" ]; then
  echo "Extension pdo_sqlite absente." >&2
  echo "Installez-la (sudo apt install php8.3-sqlite3) ou placez pdo_sqlite.so dans :" >&2
  echo "  $EXT_DIR/" >&2
  exit 1
fi

mkdir -p "$EXT_DIR"
printf 'extension=%s\n' "$EXT_DIR/pdo_sqlite.so" > "$EXT_DIR/zz-timepro-sqlite.ini"

export PHP_INI_SCAN_DIR=":$EXT_DIR"
exec php "$BACKEND_DIR/artisan" test "$@"
