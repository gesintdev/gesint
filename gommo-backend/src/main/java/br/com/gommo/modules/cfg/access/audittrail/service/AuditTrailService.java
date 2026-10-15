package br.com.gommo.modules.cfg.access.audittrail.service;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.audit.CurrentAuditor;
import br.com.gommo.core.audit.trail.AuditActionEnum;
import br.com.gommo.core.audit.trail.AuditCategoryEnum;
import br.com.gommo.core.audit.trail.AuditLog;
import br.com.gommo.core.audit.trail.AuditTrailEntry;
import br.com.gommo.core.audit.trail.AuditTrailRecorder;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.cfg.access.audittrail.dto.AuditTrailResponseDto;
import br.com.gommo.modules.cfg.access.audittrail.dto.ExportAuditRequestDto;
import br.com.gommo.modules.cfg.access.audittrail.repository.AuditTrailRepository;
import br.com.gommo.modules.cfg.access.audittrail.repository.AuditTrailRow;
import br.com.gommo.modules.cfg.access.security.AccessScopePolicy;
import br.com.gommo.modules.root.entity.AppUser;

/** Consulta da trilha de auditoria + registro pontual de exportações. */
@Service
public class AuditTrailService implements IAuditTrailService {

    private static final int MAX_PAGE_SIZE = 100;

    private final AuditTrailRepository repository;
    private final AuditTrailRecorder auditTrail;
    private final AccessScopePolicy accessScopePolicy;

    public AuditTrailService(
            AuditTrailRepository repository,
            AuditTrailRecorder auditTrail,
            AccessScopePolicy accessScopePolicy) {
        this.repository = repository;
        this.auditTrail = auditTrail;
        this.accessScopePolicy = accessScopePolicy;
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

    @Override
    @Transactional
    public void recordExport(ExportAuditRequestDto request) {
        String permission = request.getExportPermission() == null ? "" : request.getExportPermission().trim();
        if (!StringUtils.hasText(permission) || !permission.endsWith(":export")) {
            throw new BusinessException(
                    "AUDIT_EXPORT_PERMISSION_INVALID",
                    "Informe a permissão de exportação (módulo:export).",
                    HttpStatus.BAD_REQUEST);
        }
        if (!accessScopePolicy.hasAuthority(permission)) {
            throw new AccessDeniedException("Sem permissão para exportar.");
        }
        String fileName = request.getFileName().trim();
        String moduleLabel = StringUtils.hasText(request.getModuleLabel())
                ? request.getModuleLabel().trim()
                : permission.split(":")[0];
        String detail = moduleLabel;
        if (request.getRowCount() != null && request.getRowCount() >= 0) {
            detail = moduleLabel + " (" + request.getRowCount() + " linhas)";
        }
        java.util.UUID actorId = CurrentAuditor.userId().orElse(null);
        auditTrail.recordIsolated(
                AuditTrailEntry.of(AuditActionEnum.EXPORT, AppUser.class, actorId)
                        .detail(detail)
                        .recordLabel(fileName)
                        .reason(permission));
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
