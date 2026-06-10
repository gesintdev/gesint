package br.com.gommo.admin.modules.adminuser.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;

public interface AdminUserRepository extends IBaseRepository<AdminUser> {

    @Query("SELECT u FROM AdminUser u WHERE u.username = :username AND u.status <> :deleted")
    Optional<AdminUser> findActiveByUsername(String username, StatusEnum deleted);

    @Query("SELECT u FROM AdminUser u WHERE u.id = :id AND u.status <> :deleted")
    Optional<AdminUser> findActiveById(java.util.UUID id, StatusEnum deleted);

    @Query("SELECT COUNT(u) > 0 FROM AdminUser u WHERE u.username = :username AND u.status <> :deleted")
    boolean existsActiveByUsername(String username, StatusEnum deleted);

    @Query("SELECT COUNT(u) > 0 FROM AdminUser u WHERE u.email = :email AND u.status <> :deleted")
    boolean existsActiveByEmail(String email, StatusEnum deleted);
}
