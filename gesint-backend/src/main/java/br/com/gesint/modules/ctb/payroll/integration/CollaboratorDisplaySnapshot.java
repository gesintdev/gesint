package br.com.gesint.modules.ctb.payroll.integration;

import java.util.UUID;

public record CollaboratorDisplaySnapshot(UUID collaboratorId, String fullName, String cpf) {

    public static CollaboratorDisplaySnapshot empty(UUID collaboratorId) {
        return new CollaboratorDisplaySnapshot(collaboratorId, "Colaborador", "");
    }
}
