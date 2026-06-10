package br.com.gommo.modules.person.collaborators.people.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.CollaboratorAddress;

@Repository
public interface CollaboratorAddressRepository extends JpaRepository<CollaboratorAddress, UUID> {

    Optional<CollaboratorAddress> findFirstByCollaboratorIdAndPrimaryAddressTrueAndStatusNot(
            UUID collaboratorId, StatusEnum status);
}
