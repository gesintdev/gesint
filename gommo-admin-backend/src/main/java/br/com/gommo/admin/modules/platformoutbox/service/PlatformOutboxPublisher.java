package br.com.gommo.admin.modules.platformoutbox.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.gommo.admin.modules.clientcontractedsystem.entity.ClientContractedSystem;
import br.com.gommo.admin.modules.platformoutbox.entity.OutboxEventStatusEnum;
import br.com.gommo.admin.modules.platformoutbox.entity.PlatformOutboxEvent;
import br.com.gommo.admin.modules.platformoutbox.repository.PlatformOutboxEventRepository;

@Service
public class PlatformOutboxPublisher {

    public static final String EVENT_CONTRACTED_SYSTEM_CHANGED = "CONTRACTED_SYSTEM_CHANGED";
    public static final String AGGREGATE_CONTRACTED_SYSTEM = "CLIENT_CONTRACTED_SYSTEM";

    private static final ObjectMapper JSON = new ObjectMapper();

    private final PlatformOutboxEventRepository repository;

    public PlatformOutboxPublisher(PlatformOutboxEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void publishContractedSystemChanged(
            ClientContractedSystem entity, String tenantSlug, String productKey, String databaseSchema) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("clientId", entity.getClientId() != null ? entity.getClientId().toString() : null);
        payload.put("slug", tenantSlug);
        payload.put("databaseSchema", databaseSchema);
        payload.put("productKey", productKey);
        payload.put(
                "operationalStatus",
                entity.getOperationalStatus() != null ? entity.getOperationalStatus().name() : null);
        payload.put(
                "sessionPolicy",
                entity.getSessionPolicy() != null ? entity.getSessionPolicy().name() : "KEEP_UNTIL_EXPIRY");
        payload.put(
                "effectiveFrom", entity.getEffectiveFrom() != null ? entity.getEffectiveFrom().toString() : null);
        payload.put(
                "deactivateAt", entity.getDeactivateAt() != null ? entity.getDeactivateAt().toString() : null);
        payload.put("occurredAt", OffsetDateTime.now().toString());
        payload.put("contractId", entity.getId() != null ? entity.getId().toString() : null);

        OffsetDateTime now = OffsetDateTime.now();
        repository.save(PlatformOutboxEvent.builder()
                .eventType(EVENT_CONTRACTED_SYSTEM_CHANGED)
                .aggregateType(AGGREGATE_CONTRACTED_SYSTEM)
                .aggregateId(entity.getId() != null ? entity.getId() : UUID.randomUUID())
                .payload(writeJson(payload))
                .status(OutboxEventStatusEnum.PENDING)
                .attempts(0)
                .availableAt(now)
                .createdAt(now)
                .build());
    }

    private String writeJson(Map<String, Object> payload) {
        try {
            return JSON.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Falha ao serializar evento de outbox", ex);
        }
    }
}
