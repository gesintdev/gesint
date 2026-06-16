provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  user_ocid    = var.user_ocid
  fingerprint  = var.api_key_fingerprint
  # Supports both inline content (CI/CD) and local file path (local dev).
  # Set api_private_key to use inline; leave empty to fall back to api_private_key_path.
  private_key      = var.api_private_key != "" ? var.api_private_key : null
  private_key_path = var.api_private_key == "" ? var.api_private_key_path : null
  region           = var.region
}
