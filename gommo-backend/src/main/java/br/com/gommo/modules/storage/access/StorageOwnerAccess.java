package br.com.gommo.modules.storage.access;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Mapeia {@code storage_object_link.entity_type} para as authorities da entidade dona (SEG-01 · D5).
 */
public final class StorageOwnerAccess {

    /** {@code sensitive}/{@code financial} vazios = classe não aplicável para este dono. */
    public record OwnerAuthorities(String read, String sensitive, String financial) {}

    private static final Map<String, OwnerAuthorities> BY_ENTITY_TYPE = Map.of(
            "leave_request", new OwnerAuthorities("leave:read", "leave:sensitive", ""),
            "admission_process",
                    new OwnerAuthorities("admission:read", "admission:sensitive", "admission:financial"),
            "occupational_exam",
                    new OwnerAuthorities("occupationalexam:read", "occupationalexam:clinical", ""),
            "candidate", new OwnerAuthorities("candidate:read", "", ""),
            "exit_interview", new OwnerAuthorities("exitinterview:read", "", ""),
            "offboarding", new OwnerAuthorities("offboarding:read", "", ""));

    private StorageOwnerAccess() {}

    public static Optional<OwnerAuthorities> resolve(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            return Optional.empty();
        }
        String key = entityType.trim().toLowerCase(Locale.ROOT);
        return Optional.ofNullable(BY_ENTITY_TYPE.get(key));
    }
}
