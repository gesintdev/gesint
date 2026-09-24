package br.com.gommo.modules.root.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.com.gommo.modules.root.entity.UserActingProfileAssignment;

@Repository
public interface UserActingProfileAssignmentRepository extends JpaRepository<UserActingProfileAssignment, UUID> {

    List<UserActingProfileAssignment> findAllByUserId(UUID userId);

    @Modifying
    @Query("delete from UserActingProfileAssignment a where a.userId = :userId")
    void deleteAllByUserId(UUID userId);
}
