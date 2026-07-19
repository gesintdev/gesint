package br.com.gommo.admin.modules.platformoutbox.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.gommo.admin.modules.platformoutbox.entity.OutboxEventStatusEnum;
import br.com.gommo.admin.modules.platformoutbox.entity.PlatformOutboxEvent;
import br.com.gommo.admin.modules.platformoutbox.repository.PlatformOutboxEventRepository;

@Component
public class PlatformOutboxDispatcher {

    private static final Logger log = LoggerFactory.getLogger(PlatformOutboxDispatcher.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final int MAX_ATTEMPTS = 8;
    private static final int BATCH_SIZE = 20;

    private final PlatformOutboxEventRepository repository;
    private final RestClient restClient;
    private final String internalSecret;

    public PlatformOutboxDispatcher(
            PlatformOutboxEventRepository repository,
            @Value("${gommo-admin.hr.base-url:http://localhost:8081}") String hrBaseUrl,
            @Value("${gommo-admin.hr.internal-event-secret:}") String internalSecret) {
        this.repository = repository;
        this.internalSecret = internalSecret == null ? "" : internalSecret.trim();
        this.restClient = RestClient.builder().baseUrl(hrBaseUrl).build();
    }

    @Scheduled(fixedDelayString = "${gommo-admin.outbox.poll-interval-ms:5000}")
    @Transactional
    public void dispatchPending() {
        if (internalSecret.isBlank()) {
            log.warn(
                    "Outbox dispatcher idle: GOMMO_INTERNAL_EVENT_SECRET vazio — eventos ficam PENDING");
            return;
        }
        OffsetDateTime now = OffsetDateTime.now();
        List<PlatformOutboxEvent> batch =
                repository.findDispatchBatch(OutboxEventStatusEnum.PENDING, now).stream()
                        .limit(BATCH_SIZE)
                        .toList();
        for (PlatformOutboxEvent event : batch) {
            dispatchOne(event, now);
        }
    }

    private void dispatchOne(PlatformOutboxEvent event, OffsetDateTime now) {
        try {
            String payload = event.getPayload();
            if (!StringUtils.hasText(payload)) {
                throw new IllegalStateException("Outbox payload vazio");
            }
            JsonNode body = JSON.readTree(payload);
            String tenantSlug = textOrEmpty(body, "slug");
            // Enviar String JSON: Spring Boot 4 / Jackson 3 não serializa bem com.fasterxml.JsonNode.
            var request = restClient
                    .post()
                    .uri("/api/v1/internal/tenant-systems/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Internal-Event-Secret", internalSecret)
                    .header("X-Internal-Event-Type", event.getEventType());
            if (!tenantSlug.isBlank()) {
                request = request.header("X-Tenant-Slug", tenantSlug);
            }
            request.body(payload).retrieve().toBodilessEntity();
            event.setStatus(OutboxEventStatusEnum.PROCESSED);
            event.setProcessedAt(now);
            event.setLastError(null);
            repository.save(event);
            log.info(
                    "Outbox event {} dispatched type={} slug={} policy={}",
                    event.getId(),
                    event.getEventType(),
                    tenantSlug,
                    textOrEmpty(body, "sessionPolicy"));
        } catch (Exception ex) {
            int attempts = event.getAttempts() + 1;
            event.setAttempts(attempts);
            event.setLastError(ex.getMessage());
            if (attempts >= MAX_ATTEMPTS) {
                event.setStatus(OutboxEventStatusEnum.FAILED);
                log.error(
                        "Outbox event {} failed permanently after {} attempts: {}",
                        event.getId(),
                        attempts,
                        ex.getMessage());
            } else {
                event.setAvailableAt(now.plusSeconds(Math.min(300, attempts * 15L)));
                log.warn(
                        "Outbox event {} attempt {} failed: {}",
                        event.getId(),
                        attempts,
                        ex.getMessage());
            }
            repository.save(event);
        }
    }

    private static String textOrEmpty(JsonNode body, String field) {
        JsonNode node = body == null ? null : body.get(field);
        if (node == null || node.isNull()) {
            return "";
        }
        String value = node.asText();
        return value == null ? "" : value.trim();
    }
}
