package br.com.gommo.admin.modules.integration.repository;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.integration.entity.PublicAppUser;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PublicAppUserRepository extends JpaRepository<PublicAppUser, UUID> {

    @Query("SELECT COUNT(u) > 0 FROM PublicAppUser u WHERE u.username = :username AND u.status <> :deleted")
    boolean existsActiveByUsername(String username, StatusEnum deleted);

    @Query("SELECT COUNT(u) > 0 FROM PublicAppUser u WHERE u.email = :email AND u.status <> :deleted")
    boolean existsActiveByEmail(String email, StatusEnum deleted);
}
