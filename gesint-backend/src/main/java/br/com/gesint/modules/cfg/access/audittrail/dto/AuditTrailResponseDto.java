package br.com.gesint.modules.cfg.access.audittrail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditCategoryEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailResponseDto {

    private UUID id;
    private Instant occurredAt;
    private UUID userId;
    private String username;
    private String userName;
    private AuditCategoryEnum category;
    private String categoryDescription;
    private AuditActionEnum action;
    private String actionDescription;
    /** Descricao da acao + detalhe (ex.: "Leu CID", "Aprovou férias"). */
    private String actionLabel;
    private String entityName;
    private UUID entityId;
    private String recordLabel;
    private String reason;
    private String ipAddress;
}
