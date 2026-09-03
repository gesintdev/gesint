#!/bin/sh
set -e

STORAGE_PATH="${STORAGE_LOCAL_PATH:-/data/storage}"
mkdir -p "$STORAGE_PATH"
chown -R gommo:gommo "$STORAGE_PATH"

exec su-exec gommo:gommo java -XX:+UseContainerSupport -jar /app/app.jar "$@"
