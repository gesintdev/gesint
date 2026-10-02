package br.com.gommo.modules.cfg.settings.agenda.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.audit.trail.AuditActionEnum;
import br.com.gommo.core.audit.trail.AuditTrailEntry;
import br.com.gommo.core.audit.trail.AuditTrailRecorder;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventRequestDto;
import br.com.gommo.modules.cfg.settings.agenda.dto.AgendaEventResponseDto;
import br.com.gommo.modules.cfg.settings.agenda.entity.AgendaEvent;
import br.com.gommo.modules.cfg.settings.agenda.exception.AgendaException;
import br.com.gommo.modules.cfg.settings.agenda.mapper.AgendaEventMapper;
import br.com.gommo.modules.cfg.settings.agenda.repository.AgendaEventRepository;

@Service
public class AgendaEventService implements IAgendaEventService {

    private final AgendaEventRepository repository;
    private final AgendaEventMapper mapper;
    private final AuditTrailRecorder auditTrail;

    public AgendaEventService(
            AgendaEventRepository repository, AgendaEventMapper mapper, AuditTrailRecorder auditTrail) {
        this.repository = repository;
        this.mapper = mapper;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<AgendaEventResponseDto> listInRange(OffsetDateTime from, OffsetDateTime to) {
        UUID ownerId = currentUserId();
        OffsetDateTime rangeFrom = from;
        OffsetDateTime rangeTo = to;
        if (rangeFrom == null || rangeTo == null) {
            throw AgendaException.rangeInvalid();
        }
        if (rangeTo.isBefore(rangeFrom)) {
            rangeTo = rangeFrom;
        }
        return repository.findOwnedInRange(ownerId, rangeFrom, rangeTo, StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public AgendaEventResponseDto create(AgendaEventRequestDto request) {
        validate(request);
        AgendaEvent entity = mapper.toEntity(request);
        entity.setOwnerUserId(currentUserId());
        entity.setStatus(StatusEnum.ACTIVE);
        AgendaEvent saved = repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.CREATE, saved));
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public AgendaEventResponseDto update(UUID id, AgendaEventRequestDto request) {
        validate(request);
        AgendaEvent entity = findOwned(id);
        mapper.updateEntity(entity, request);
        AgendaEvent saved = repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, saved));
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public void delete(UUID id) {
        AgendaEvent entity = findOwned(id);
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.DELETE, entity));
    }

    private AgendaEvent findOwned(UUID id) {
        return repository
                .findByIdAndOwnerUserIdAndStatusNot(id, currentUserId(), StatusEnum.DELETED)
                .orElseThrow(AgendaException::notFound);
    }

    private void validate(AgendaEventRequestDto request) {
        if (request == null || !StringUtils.hasText(request.getTitle())) {
            throw AgendaException.titleRequired();
        }
        if (request.getStartsAt() == null || request.getEndsAt() == null) {
            throw AgendaException.rangeInvalid();
        }
        if (request.getEndsAt().isBefore(request.getStartsAt())) {
            throw AgendaException.rangeInvalid();
        }
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UUID userId)) {
            throw AgendaException.unauthenticated();
        }
        return userId;
    }
}
