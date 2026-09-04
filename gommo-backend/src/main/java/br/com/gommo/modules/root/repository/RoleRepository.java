package br.com.gommo.modules.root.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.entity.RoleTypeEnum;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.root.entity.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    Optional<Role> findByNameIgnoreCaseAndSystemAndStatusNot(
            String name, SystemScopeEnum system, StatusEnum status);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id AND r.status <> :deleted")
    Optional<Role> findByIdWithPermissions(UUID id, StatusEnum deleted);

    @Query(
            """
            SELECT DISTINCT r FROM Role r
            LEFT JOIN FETCH r.permissions
            WHERE r.id IN :ids
            """)
    List<Role> findAllByIdWithPermissions(@org.springframework.data.repository.query.Param("ids") Collection<UUID> ids);

    List<Role> findAllBySystemRoleFalseAndStatusNotOrderByCreatedAtDesc(StatusEnum status);

    List<Role> findAllBySystemAndSystemRoleFalseAndStatusNotOrderByCreatedAtDesc(
            SystemScopeEnum system, StatusEnum status);

    @Query(
            """
            SELECT DISTINCT r FROM Role r
            LEFT JOIN FETCH r.permissions
            WHERE r.roleType IN :types AND r.status <> :deleted
            ORDER BY r.roleType ASC, r.createdAt DESC
            """)
    List<Role> findAllProfilesWithPermissions(Collection<RoleTypeEnum> types, StatusEnum deleted);

    @Query(
            """
            SELECT DISTINCT r FROM Role r
            LEFT JOIN FETCH r.permissions
            WHERE r.system = :system AND r.roleType IN :types AND r.status <> :deleted
            ORDER BY r.roleType ASC, r.createdAt DESC
            """)
    List<Role> findAllProfilesWithPermissionsBySystem(
            SystemScopeEnum system, Collection<RoleTypeEnum> types, StatusEnum deleted);
}
