package br.com.gommo.modules.root.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.entity.AppUser;

public interface AppUserRepository extends IBaseRepository<AppUser> {

    @Query(
            "SELECT u FROM AppUser u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.username = :username AND u.status <> :deleted")
    Optional<AppUser> findActiveByUsername(String username, StatusEnum deleted);

    @Query(
            """
            SELECT u
            FROM AppUser u
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH r.permissions
            WHERE u.status <> :deleted
              AND (LOWER(u.username) = LOWER(:login) OR LOWER(u.email) = LOWER(:login))
            """)
    Optional<AppUser> findActiveByLogin(String login, StatusEnum deleted);

    @Query(
            "SELECT u FROM AppUser u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.id = :id AND u.status <> :deleted")
    Optional<AppUser> findActiveByIdWithRoles(UUID id, StatusEnum deleted);

    @Query("SELECT u FROM AppUser u LEFT JOIN FETCH u.roles WHERE u.id = :id AND u.status <> :deleted")
    Optional<AppUser> findByIdWithRoles(UUID id, StatusEnum deleted);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, UUID id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByCollaboratorIdAndStatusNot(UUID collaboratorId, StatusEnum status);

    boolean existsByCollaboratorIdAndIdNotAndStatusNot(UUID collaboratorId, UUID id, StatusEnum status);
}
