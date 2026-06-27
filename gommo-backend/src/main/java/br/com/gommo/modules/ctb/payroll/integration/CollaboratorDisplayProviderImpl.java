package br.com.gommo.modules.ctb.payroll.integration;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;

@Component
public class CollaboratorDisplayProviderImpl implements CollaboratorDisplayProvider {

    private final CollaboratorRepository collaboratorRepository;

    public CollaboratorDisplayProviderImpl(CollaboratorRepository collaboratorRepository) {
        this.collaboratorRepository = collaboratorRepository;
    }

    @Override
    public Optional<CollaboratorDisplaySnapshot> findById(UUID collaboratorId) {
        return collaboratorRepository
                .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .map(this::toSnapshot);
    }

    private CollaboratorDisplaySnapshot toSnapshot(Collaborator collaborator) {
        return new CollaboratorDisplaySnapshot(
                collaborator.getId(),
                collaborator.getFullName(),
                collaborator.getCpf() != null ? collaborator.getCpf() : "");
    }
}
