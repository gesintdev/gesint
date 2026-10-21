package br.com.gesint.modules.ctb.payroll.integration;

import java.util.Optional;
import java.util.UUID;

public interface CollaboratorDisplayProvider {

    Optional<CollaboratorDisplaySnapshot> findById(UUID collaboratorId);
}
