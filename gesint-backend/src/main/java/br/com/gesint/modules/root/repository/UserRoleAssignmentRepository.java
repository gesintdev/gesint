package br.com.gesint.modules.root.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.com.gesint.modules.root.entity.UserRoleAssignment;

@Repository
public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, UUID> {

    List<UserRoleAssignment> findAllByUserId(UUID userId);

    @Modifying
    @Query("delete from UserRoleAssignment a where a.userId = :userId")
    void deleteAllByUserId(UUID userId);

    /** Filiais em que o usuario tem ao menos um perfil ativo. */
    @Query(
            """
            select distinct a.companyId
              from UserRoleAssignment a
             where a.userId = :userId
               and a.companyId is not null
            """)
    List<UUID> findBranchIdsByUserId(UUID userId);
}
