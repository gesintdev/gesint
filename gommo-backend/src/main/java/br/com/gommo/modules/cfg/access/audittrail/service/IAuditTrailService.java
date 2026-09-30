package br.com.gommo.modules.cfg.access.audittrail.service;

import java.time.Instant;

import br.com.gommo.core.audit.trail.AuditCategoryEnum;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.cfg.access.audittrail.dto.AuditTrailResponseDto;

public interface IAuditTrailService {

    PageableResponseDto<AuditTrailResponseDto> search(
            int page, int size, Instant from, AuditCategoryEnum category, String search);
}
