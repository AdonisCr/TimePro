#!/usr/bin/env bash
# Base MySQL locale dediee a Time Pro (aucun sudo requis).
#
# Pourquoi une copie du binaire ? AppArmor (securite Ubuntu) interdit au
# binaire /usr/sbin/mysqld d'ecrire hors de /var/lib/mysql et /tmp.
# Une copie du binaire dans /tmp n'est pas confinee par ce profil, ce qui
# permet de stocker les donnees dans Backend/.mysql-data (persistant).
#
# Usage :
#   ./scripts/dev-db.sh start   # demarre MySQL sur 127.0.0.1:3307
#   ./scripts/dev-db.sh stop    # arrete proprement
#   ./scripts/dev-db.sh status  # etat + test de connexion
#   ./scripts/dev-db.sh shell   # ouvre le client mysql

set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$BACKEND_DIR/.mysql-data/data"
RUN_DIR="$BACKEND_DIR/.mysql-data/run"
SOCKET="$RUN_DIR/mysql.sock"
PIDFILE="$RUN_DIR/mysqld.pid"
LOG="$BACKEND_DIR/.mysql-data/server.log"
PORT="${TIMEPRO_DB_PORT:-3307}"
BIN="/tmp/mysqld-timepro"
DB_NAME="${TIMEPRO_DB_NAME:-time_tracking}"

mysqladmin_bin() {
  mysqladmin --protocol=SOCKET --socket="$SOCKET" -u root "$@"
}

is_running() {
  [ -S "$SOCKET" ] && mysqladmin_bin ping >/dev/null 2>&1
}

write_env_hint() {
  if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "Attention : Backend/.env est absent (copier .env.example)."
  fi
}

prepare() {
  mkdir -p "$RUN_DIR"
  if [ ! -d "$DATA_DIR/mysql" ]; then
    echo "Initialisation du dossier de donnees ($DATA_DIR)..."
    rm -rf "$DATA_DIR"
    mkdir -p "$DATA_DIR"
    cp /usr/sbin/mysqld "$BIN"
    chmod +x "$BIN"
    "$BIN" --no-defaults --initialize-insecure \
      --datadir="$DATA_DIR" \
      --lc-messages-dir=/usr/share/mysql \
      --log-error="$BACKEND_DIR/.mysql-data/init.log"
  fi
}

start() {
  prepare
  if is_running; then
    echo "MySQL deja demarre (socket: $SOCKET, port: $PORT)."
    return 0
  fi
  cp /usr/sbin/mysqld "$BIN"
  chmod +x "$BIN"
  echo "Demarrage de MySQL (port $PORT)..."
  nohup "$BIN" --no-defaults \
    --datadir="$DATA_DIR" \
    --lc-messages-dir=/usr/share/mysql \
    --socket="$SOCKET" \
    --port="$PORT" \
    --bind-address=127.0.0.1 \
    --pid-file="$PIDFILE" \
    --log-error="$LOG" \
    --mysqlx=0 \
    >/dev/null 2>&1 &

  for _ in $(seq 1 30); do
    if is_running; then
      mysql --protocol=SOCKET --socket="$SOCKET" -u root \
        -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
      echo "MySQL pret : 127.0.0.1:$PORT (base $DB_NAME)."
      write_env_hint
      return 0
    fi
    sleep 1
  done
  echo "Echec du demarrage. Voir $LOG" >&2
  tail -20 "$LOG" >&2 || true
  return 1
}

stop() {
  if ! is_running; then
    echo "MySQL deja arrete."
    return 0
  fi
  mysqladmin_bin shutdown
  echo "MySQL arrete."
}

status() {
  if is_running; then
    echo "MySQL en marche (socket: $SOCKET, port: $PORT)."
    mysql --protocol=SOCKET --socket="$SOCKET" -u root -e "SELECT VERSION();"
  else
    echo "MySQL arrete."
    return 1
  fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  shell) exec mysql --protocol=SOCKET --socket="$SOCKET" -u root "$DB_NAME" ;;
  *) echo "Usage: $0 {start|stop|status|shell}" >&2; exit 2 ;;
esac
