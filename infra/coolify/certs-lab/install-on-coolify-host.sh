#!/usr/bin/env bash
set -euo pipefail
# Rode no Linux Mint (host Coolify) como root/sudo.
# Os arquivos .crt/.key devem estar no mesmo diretorio deste script
# (ou ajuste SRC).

SRC="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR=/data/coolify/proxy/certs
DYN_DIR=/data/coolify/proxy/dynamic

sudo install -d -m 700 "$CERT_DIR"
sudo cp "$SRC/gommo.local.fullchain.crt" "$CERT_DIR/gommo.local.crt"
sudo cp "$SRC/gommo.local.key" "$CERT_DIR/gommo.local.key"
sudo chmod 600 "$CERT_DIR/gommo.local.key"
sudo chmod 644 "$CERT_DIR/gommo.local.crt"

sudo tee "$DYN_DIR/gommo-lab-certs.yaml" >/dev/null <<EOF
tls:
  certificates:
    - certFile: /traefik/certs/gommo.local.crt
      keyFile: /traefik/certs/gommo.local.key
EOF

echo "Certs installed. Restart the Coolify Proxy (Servers > localhost > Proxy > Restart)."
echo "On Windows, trust gommo-lab-ca.cer (already attempted for Current User)."
