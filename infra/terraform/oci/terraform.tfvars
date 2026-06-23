# Valores nao-sensiveis. Credenciais (OCIDs, chaves) vem de env vars / GitHub Secrets.
# Para uso local: preencha tambem api_private_key_path com o caminho do seu .pem

region = "sa-saopaulo-1"

# Libera SSH e painel Coolify (porta 8000) para qualquer IP.
# Recomendado restringir para seu IP apos o provisionamento: "SEU_IP/32"
allowed_ssh_cidr = "0.0.0.0/0"

# Oracle Free Tier Ampere - ate 2 OCPU / 12 GB gratis na conta
shape                   = "VM.Standard.A1.Flex"
instance_ocpus          = 1
instance_memory_in_gbs  = 6
boot_volume_size_in_gbs = 100

install_docker_on_boot  = true
install_coolify_on_boot = true
