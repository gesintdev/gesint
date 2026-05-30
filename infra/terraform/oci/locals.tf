locals {
  is_arm_shape = startswith(var.shape, "VM.Standard.A1")

  ubuntu_image_filter = local.is_arm_shape ? {
    operating_system         = "Canonical Ubuntu"
    operating_system_version = "22.04"
    shape                    = "VM.Standard.A1.Flex"
    } : {
    operating_system         = "Canonical Ubuntu"
    operating_system_version = "22.04"
    shape                    = "VM.Standard.E2.1.Micro"
  }

  common_tags = {
    Project     = var.project_name
    ManagedBy   = "terraform"
    Environment = "production"
  }
}
