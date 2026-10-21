package br.com.gesint.admin.modules.integration.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gesint.admin.modules.integration.entity.PublicPermission;

public interface PublicPermissionRepository extends JpaRepository<PublicPermission, UUID> {}
