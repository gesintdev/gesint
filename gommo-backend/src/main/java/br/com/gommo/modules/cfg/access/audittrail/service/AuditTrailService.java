package br.com.gommo.modules.cfg.access.audittrail.service;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.audit.trail.AuditCategoryEnum;
import br.com.gommo.core.audit.trail.AuditLog;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.cfg.access.audittrail.dto.AuditTrailResponseDto;
import br.com.gommo.modules.cfg.access.audittrail.repository.AuditTrailRepository;
import br.com.gommo.modules.cfg.access.audittrail.repository.AuditTrailRow;

/** Consulta da trilha de auditoria: somente leitura (o registro e imutavel). */
@Service
public class AuditTrailService implements IAuditTrailService {

    private static final int MAX_PAGE_SIZE = 100;

    private final AuditTrailRepository repository;

    public AuditTrailService(AuditTrailRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('audit:read')")
    public PageableResponseDto<AuditTrailResponseDto> search(
            int page, int size, Instant from, AuditCategoryEnum category, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        Page<AuditTrailRow> result = repository.search(
                from == null ? Instant.EPOCH : from,
                category,
                TextSearchUtils.toLikePattern(search),
                PageRequest.of(safePage, safeSize));
        return PageableResponseDto.<AuditTrailResponseDto>builder()
                .content(result.getContent().stream().map(AuditTrailService::toResponse).toList())
                .page(safePage)
                .size(safeSize)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private static AuditTrailResponseDto toResponse(AuditTrailRow row) {
        AuditLog log = row.log();
        String actionDescription = log.getAction().getDescription();
        return AuditTrailResponseDto.builder()
                .id(log.getId())
                .occurredAt(log.getOccurredAt())
                .userId(log.getUserId())
                .username(row.username())
                .userName(row.userName())
                .category(log.getCategory())
                .categoryDescription(log.getCategory().getDescription())
                .action(log.getAction())
                .actionDescription(actionDescription)
                .actionLabel(log.getDetail() == null ? actionDescription : actionDescription + " " + log.getDetail())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .recordLabel(log.getRecordLabel())
                .reason(log.getReason())
                .ipAddress(log.getIpAddress() == null ? null : log.getIpAddress().getHostAddress())
                .build();
    }
}
