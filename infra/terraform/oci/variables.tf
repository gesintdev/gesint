variable "tenancy_ocid" {
  type        = string
  description = "OCID do tenancy (Console OCI > Tenancy Details)."
}

variable "user_ocid" {
  type        = string
  description = "OCID do usuario da API (Identity > Users > seu usuario > OCID)."
}

variable "compartment_id" {
  type        = string
  description = "OCID do compartment onde a VM sera criada (pode ser o root compartment)."
}

variable "api_key_fingerprint" {
  type        = string
  description = "Fingerprint da chave API (ex.: aa:bb:cc:...)."
}

variable "api_private_key_path" {
  type        = string
  description = "Caminho local para o arquivo .pem da chave API (nunca commitar)."
}

variable "region" {
  type        = string
  description = "Regiao OCI (ex.: sa-saopaulo-1, us-ashburn-1)."
  default     = "sa-saopaulo-1"
}

variable "project_name" {
  type        = string
  description = "Prefixo dos recursos na nuvem."
  default     = "gommo"
}

variable "instance_display_name" {
  type        = string
  description = "Nome exibido da instancia no console OCI."
  default     = "gommo-coolify"
}

variable "ssh_public_key" {
  type        = string
  description = "Chave SSH publica (conteudo de id_ed25519.pub ou id_rsa.pub) para acesso root/ubuntu."
}

variable "allowed_ssh_cidr" {
  type        = string
  description = "CIDR autorizado para SSH e painel Coolify (8000). Use seu IP/32 (ex.: 203.0.113.10/32)."
}

variable "shape" {
  type        = string
  description = "Shape da VM. Free Tier Ampere: VM.Standard.A1.Flex. Alternativa AMD: VM.Standard.E2.1.Micro."
  default     = "VM.Standard.A1.Flex"
}

variable "instance_ocpus" {
  type        = number
  description = "OCPUs (Ampere Flex). Free Tier permite ate 4 OCPUs no total da conta."
  default     = 2
}

variable "instance_memory_in_gbs" {
  type        = number
  description = "RAM em GB (Ampere Flex). Free Tier permite ate 24 GB no total da conta."
  default     = 12
}

variable "boot_volume_size_in_gbs" {
  type        = number
  description = "Disco boot. Free Tier: ate 200 GB de block storage no total."
  default     = 100
}

variable "install_coolify_on_boot" {
  type        = bool
  description = "Se true, cloud-init instala Coolify automaticamente (pode levar alguns minutos)."
  default     = false
}

variable "install_docker_on_boot" {
  type        = bool
  description = "Se true, cloud-init instala Docker (recomendado antes do Coolify)."
  default     = true
}
