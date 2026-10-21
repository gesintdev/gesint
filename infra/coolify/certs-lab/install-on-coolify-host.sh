#!/usr/bin/env bash
set -euo pipefail
# Rode no Linux Mint (host Coolify) como root/sudo.
# Os arquivos .crt/.key devem estar no mesmo diretorio deste script
# (ou ajuste SRC).

SRC="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR=/data/coolify/proxy/certs
DYN_DIR=/data/coolify/proxy/dynamic

sudo install -d -m 700 "$CERT_DIR"
sudo cp "$SRC/gesint.local.fullchain.crt" "$CERT_DIR/gesint.local.crt"
sudo cp "$SRC/gesint.local.key" "$CERT_DIR/gesint.local.key"
sudo chmod 600 "$CERT_DIR/gesint.local.key"
sudo chmod 644 "$CERT_DIR/gesint.local.crt"

sudo tee "$DYN_DIR/gesint-lab-certs.yaml" >/dev/null <<EOF
tls:
  certificates:
    - certFile: /traefik/certs/gesint.local.crt
      keyFile: /traefik/certs/gesint.local.key
EOF

echo "Certs installed. Restart the Coolify Proxy (Servers > localhost > Proxy > Restart)."
echo "On Windows, trust gesint-lab-ca.cer (already attempted for Current User)."
