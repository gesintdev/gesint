package br.com.gommo.modules.root.repository;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.access.entity.SystemScopeEnum;
import br.com.gommo.modules.root.entity.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id AND r.status <> :deleted")
    Optional<Role> findByIdWithPermissions(UUID id, StatusEnum deleted);

    List<Role> findAllBySystemRoleFalseAndStatusNotOrderByCreatedAtDesc(StatusEnum status);

    List<Role> findAllBySystemAndSystemRoleFalseAndStatusNotOrderByCreatedAtDesc(
            SystemScopeEnum system, StatusEnum status);

    @Query("""
            SELECT DISTINCT r FROM Role r
            LEFT JOIN FETCH r.permissions
            WHERE r.systemRole = false AND r.status <> :deleted
            ORDER BY r.createdAt DESC
            """)
    List<Role> findAllCustomProfilesWithPermissions(StatusEnum deleted);

    @Query("""
            SELECT DISTINCT r FROM Role r
            LEFT JOIN FETCH r.permissions
            WHERE r.system = :system AND r.systemRole = false AND r.status <> :deleted
            ORDER BY r.createdAt DESC
            """)
    List<Role> findAllCustomProfilesWithPermissionsBySystem(SystemScopeEnum system, StatusEnum deleted);
}
