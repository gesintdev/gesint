#!/bin/sh
set -e

STORAGE_PATH="${STORAGE_LOCAL_PATH:-/data/storage}"
mkdir -p "$STORAGE_PATH"

if [ "$(id -u)" = "0" ]; then
    chown -R gesint:gesint "$STORAGE_PATH"
    exec su-exec gesint:gesint java -XX:+UseContainerSupport -jar /app/app.jar "$@"
fi

echo "WARN: entrypoint nao esta como root; permissoes de ${STORAGE_PATH} nao foram ajustadas" >&2
exec java -XX:+UseContainerSupport -jar /app/app.jar "$@"
