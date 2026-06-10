package br.com.gommo.admin.modules.integration.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gommo.admin.modules.integration.entity.PublicRole;

public interface PublicRoleRepository extends JpaRepository<PublicRole, UUID> {

    Optional<PublicRole> findByName(String name);
}
