package br.com.gommo.admin.modules.integration.repository;

import br.com.gommo.admin.modules.integration.entity.PublicAppUser;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicAppUserRepository extends JpaRepository<PublicAppUser, UUID> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
