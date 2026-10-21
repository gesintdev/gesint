package br.com.gesint.core.audit.trail;

import java.util.UUID;

/**
 * Evento a gravar na trilha. O registro afetado vem da entidade carregada ou do par tipo + id
 * (o gravador busca a entidade para montar o rotulo "Tipo #codigo").
 */
public final class AuditTrailEntry {

    private final AuditActionEnum action;
    private final Object entity;
    private final Class<?> entityType;
    private final UUID entityId;
    private String detail;
    private String reason;
    private String recordLabel;
    private UUID actorId;

    private AuditTrailEntry(AuditActionEnum action, Object entity, Class<?> entityType, UUID entityId) {
        this.action = action;
        this.entity = entity;
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public static AuditTrailEntry of(AuditActionEnum action, Object entity) {
        return new AuditTrailEntry(action, entity, null, null);
    }

    public static AuditTrailEntry of(AuditActionEnum action, Class<?> entityType, UUID entityId) {
        return new AuditTrailEntry(action, null, entityType, entityId);
    }

    /** Complemento da acao exibido apos a descricao (ex.: "férias", "CID"). */
    public AuditTrailEntry detail(String detail) {
        this.detail = detail;
        return this;
    }

    public AuditTrailEntry reason(String reason) {
        this.reason = reason;
        return this;
    }

    /** Sobrescreve o rotulo calculado do registro. */
    public AuditTrailEntry recordLabel(String recordLabel) {
        this.recordLabel = recordLabel;
        return this;
    }

    /** Autor explicito, quando ainda nao ha usuario autenticado (login). */
    public AuditTrailEntry actor(UUID actorId) {
        this.actorId = actorId;
        return this;
    }

    public AuditActionEnum getAction() {
        return action;
    }

    public Object getEntity() {
        return entity;
    }

    public Class<?> getEntityType() {
        return entityType;
    }

    public UUID getEntityId() {
        return entityId;
    }

    public String getDetail() {
        return detail;
    }

    public String getReason() {
        return reason;
    }

    public String getRecordLabel() {
        return recordLabel;
    }

    public UUID getActorId() {
        return actorId;
    }
}
