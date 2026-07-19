package br.com.gommo.modules.root.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSystemEventRequestDto {

    private String clientId;
    private String slug;
    /** Schema físico do tenant (ex.: tenant_coca_cola), enviado pelo Admin no outbox. */
    private String databaseSchema;
    private String productKey;
    private String operationalStatus;
    private String sessionPolicy;
    private String effectiveFrom;
    private String deactivateAt;
    private String occurredAt;
    private String contractId;
}
