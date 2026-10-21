package br.com.gesint.core.audit.trail;

import java.util.UUID;

import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.branch.BranchContextHolder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Grava eventos na trilha de auditoria ({@code audit_log}).
 *
 * <ul>
 *   <li>{@link #record}: na transacao da operacao (decisoes, acesso, CRUD). Se a operacao
 *       falhar, o evento some junto.</li>
 *   <li>{@link #recordIsolated}: transacao propria. Obrigatorio em leituras (transacao
 *       {@code readOnly} nao aceita INSERT) e em falhas que desfazem a transacao corrente
 *       (login recusado).</li>
 * </ul>
 *
 * Falha ao gravar propaga: acesso a dado sensivel sem registro nao deve ser servido.
 */
@Component
public class AuditTrailRecorder {

    private static final int RECORD_LABEL_MAX = 200;
    private static final int DETAIL_MAX = 500;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRED)
    public void record(AuditTrailEntry entry) {
        entityManager.persist(toLog(entry));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordIsolated(AuditTrailEntry entry) {
        entityManager.persist(toLog(entry));
    }

    private AuditLog toLog(AuditTrailEntry entry) {
        Object entity = entry.getEntity() == null ? null : Hibernate.unproxy(entry.getEntity());
        Class<?> type = entity != null ? entity.getClass() : entry.getEntityType();
        UUID entityId = entry.getEntityId();
        if (entity != null && entityId == null) {
            entityId = identifierOf(entity);
        }
        if (entity == null && type != null && entityId != null) {
            entity = entityManager.find(type, entityId);
        }
        String recordLabel = entry.getRecordLabel() != null
                ? entry.getRecordLabel()
                : type == null ? null : AuditRecordLabels.of(type, entity);

        AuditActionEnum action = entry.getAction();
        return AuditLog.builder()
                .entityName(type == null ? "-" : type.getSimpleName())
                .entityId(entityId)
                .action(action)
                .category(action.getCategory())
                .recordLabel(truncate(recordLabel, RECORD_LABEL_MAX))
                .detail(truncate(entry.getDetail(), DETAIL_MAX))
                .reason(blankToNull(entry.getReason()))
                .userId(entry.getActorId() != null ? entry.getActorId() : CurrentAuditor.userId().orElse(null))
                .ipAddress(ClientAddressResolver.current())
                .companyId(BranchContextHolder.getOptional().orElse(null))
                .build();
    }

    private UUID identifierOf(Object entity) {
        Object id = entityManager.getEntityManagerFactory().getPersistenceUnitUtil().getIdentifier(entity);
        return id instanceof UUID uuid ? uuid : null;
    }

    private static String truncate(String value, int max) {
        String normalized = blankToNull(value);
        if (normalized == null || normalized.length() <= max) {
            return normalized;
        }
        return normalized.substring(0, max);
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
