package br.com.gommo.admin.modules.integration.repository;

import br.com.gommo.admin.modules.integration.entity.PublicPermission;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicPermissionRepository extends JpaRepository<PublicPermission, UUID> {}
