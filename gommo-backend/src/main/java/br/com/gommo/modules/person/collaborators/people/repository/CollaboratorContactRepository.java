package br.com.gommo.modules.person.collaborators.people.repository;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.CollaboratorContact;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollaboratorContactRepository extends JpaRepository<CollaboratorContact, UUID> {

    Optional<CollaboratorContact> findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(
            UUID collaboratorId, StatusEnum status);
}
