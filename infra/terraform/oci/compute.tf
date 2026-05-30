data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_id
  operating_system           = local.ubuntu_image_filter.operating_system
  operating_system_version   = local.ubuntu_image_filter.operating_system_version
  shape                      = local.ubuntu_image_filter.shape
  sort_by                    = "TIMECREATED"
  sort_order                 = "DESC"
  state                      = "AVAILABLE"
}

resource "oci_core_instance" "app" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = var.instance_display_name
  shape               = var.shape

  dynamic "shape_config" {
    for_each = var.shape == "VM.Standard.A1.Flex" ? [1] : []
    content {
      ocpus         = var.instance_ocpus
      memory_in_gbs = var.instance_memory_in_gbs
    }
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
  }

  create_vnic_details {
    assign_public_ip = true
    subnet_id        = oci_core_subnet.public.id
    display_name     = "${var.project_name}-vnic"
    hostname_label   = var.project_name
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml.tpl", {
      install_docker  = var.install_docker_on_boot
      install_coolify = var.install_coolify_on_boot
      hostname        = var.instance_display_name
    }))
  }

  freeform_tags = local.common_tags
}
