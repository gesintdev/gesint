#cloud-config
hostname: ${hostname}
timezone: America/Sao_Paulo

package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - ufw
  - ca-certificates
  - gnupg

write_files:
  - path: /etc/gommo-bootstrap.env
    content: |
      INSTALL_DOCKER=${install_docker}
      INSTALL_COOLIFY=${install_coolify}

runcmd:
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 22/tcp
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw allow 8000/tcp
  - ufw --force enable
  - |
    set -euo pipefail
    source /etc/gommo-bootstrap.env
    if [ "$INSTALL_DOCKER" = "true" ]; then
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      systemctl enable docker
      systemctl start docker
      usermod -aG docker ubuntu || true
    fi
    if [ "$INSTALL_COOLIFY" = "true" ]; then
      curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
    fi
  - touch /var/log/gommo-cloud-init-done

final_message: "Gommo VPS pronta. Instale o Coolify manualmente se nao usou install_coolify_on_boot."
