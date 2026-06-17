package br.com.gommo.modules.rh.person.collaborators.people.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.CollaboratorContact;

@Repository
public interface CollaboratorContactRepository extends JpaRepository<CollaboratorContact, UUID> {

    Optional<CollaboratorContact> findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(
            UUID collaboratorId, StatusEnum status);
}
