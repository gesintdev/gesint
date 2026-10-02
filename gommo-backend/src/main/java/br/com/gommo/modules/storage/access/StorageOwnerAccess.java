package br.com.gommo.modules.storage.access;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Mapeia {@code storage_object_link.entity_type} para as authorities da entidade dona (SEG-01 · D5).
 */
public final class StorageOwnerAccess {

    /**
     * {@code sensitive}/{@code financial} vazios = classe não aplicável para este dono.
     * {@code label}: nome da entidade dona exibido na trilha de auditoria.
     */
    public record OwnerAuthorities(String read, String sensitive, String financial, String label) {}

    private static final Map<String, OwnerAuthorities> BY_ENTITY_TYPE = Map.of(
            "leave_request", new OwnerAuthorities("leave:read", "leave:sensitive", "", "Afastamento"),
            "admission_process",
                    new OwnerAuthorities(
                            "admission:read", "admission:sensitive", "admission:financial", "Admissão"),
            "occupational_exam",
                    new OwnerAuthorities(
                            "occupationalexam:read", "occupationalexam:clinical", "", "Exame ocupacional"),
            "candidate", new OwnerAuthorities("candidate:read", "", "", "Candidato"),
            "exit_interview", new OwnerAuthorities("exitinterview:read", "", "", "Entrevista de desligamento"),
            "offboarding", new OwnerAuthorities("offboarding:read", "", "", "Desligamento"));

    private StorageOwnerAccess() {}

    public static Optional<OwnerAuthorities> resolve(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            return Optional.empty();
        }
        String key = entityType.trim().toLowerCase(Locale.ROOT);
        return Optional.ofNullable(BY_ENTITY_TYPE.get(key));
    }
}
