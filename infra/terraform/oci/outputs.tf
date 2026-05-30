output "instance_public_ip" {
  description = "IP publico da VPS (use no Coolify e no DNS)."
  value       = oci_core_instance.app.public_ip
}

output "instance_ocid" {
  description = "OCID da instancia (suporte OCI)."
  value       = oci_core_instance.app.id
}

output "ssh_command" {
  description = "Comando SSH (usuario padrao Ubuntu na imagem Canonical)."
  value       = "ssh ubuntu@${oci_core_instance.app.public_ip}"
}

output "coolify_dashboard_url" {
  description = "URL do painel Coolify (libere apenas do seu IP na security list)."
  value       = "http://${oci_core_instance.app.public_ip}:8000"
}

output "next_steps" {
  description = "Resumo do que fazer apos o terraform apply."
  value       = <<-EOT
    1. Aguarde 2-5 min apos o apply (cloud-init).
    2. SSH: ssh ubuntu@${oci_core_instance.app.public_ip}
    3. Se Coolify nao foi instalado no boot: curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
    4. Acesse o Coolify em http://${oci_core_instance.app.public_ip}:8000
    5. Siga infra/coolify/README.md para subir o stack Gommo.
  EOT
}
