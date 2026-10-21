package br.com.gesint.modules.cfg.access.actingprofile.service;

import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.persistence.EntityCodeIncrementer;
import br.com.gesint.modules.cfg.access.actingprofile.dto.ActingProfileRequestDto;
import br.com.gesint.modules.cfg.access.actingprofile.dto.ActingProfileResponseDto;
import br.com.gesint.modules.cfg.access.actingprofile.entity.ActingProfile;
import br.com.gesint.modules.cfg.access.actingprofile.entity.DataScopeEnum;
import br.com.gesint.modules.cfg.access.actingprofile.exception.ActingProfileException;
import br.com.gesint.modules.cfg.access.actingprofile.mapper.ActingProfileMapper;
import br.com.gesint.modules.cfg.access.actingprofile.repository.ActingProfileRepository;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gesint.modules.cfg.access.security.AccessScopePolicy;

@Service
public class ActingProfileService implements IActingProfileService {

    private final ActingProfileRepository repository;
    private final ActingProfileMapper mapper;
    private final AccessScopePolicy accessScopePolicy;
    private final EntityManager entityManager;
    private final AuditTrailRecorder auditTrail;

    public ActingProfileService(
            ActingProfileRepository repository,
            ActingProfileMapper mapper,
            AccessScopePolicy accessScopePolicy,
            EntityManager entityManager,
            AuditTrailRecorder auditTrail) {
        this.repository = repository;
        this.mapper = mapper;
        this.accessScopePolicy = accessScopePolicy;
        this.entityManager = entityManager;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('actingprofile:read')")
    public List<ActingProfileResponseDto> findAll(SystemScopeEnum system, boolean includeInactive) {
        List<ActingProfile> profiles = system == null
                ? repository.findAllByStatusNotOrderByNameAsc(StatusEnum.DELETED)
                : repository.findAllBySystemAndStatusNotOrderByNameAsc(system, StatusEnum.DELETED);
        return profiles.stream()
                .filter(profile -> includeInactive || profile.getStatus() == StatusEnum.ACTIVE)
                .filter(profile -> accessScopePolicy.isSystemContracted(profile.getSystem()))
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('actingprofile:read')")
    public ActingProfileResponseDto findById(UUID id) {
        return mapper.toResponse(findProfile(id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('actingprofile:write')")
    public ActingProfileResponseDto create(ActingProfileRequestDto request) {
        validateRequest(request, null);
        ActingProfile entity = mapper.toEntity(request);
        entity.setCode(EntityCodeIncrementer.nextCode(entityManager, ActingProfile.class));
        entity.setStatus(StatusEnum.ACTIVE);
        ActingProfile saved = repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.CREATE, saved));
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('actingprofile:write')")
    public ActingProfileResponseDto update(UUID id, ActingProfileRequestDto request) {
        ActingProfile entity = findProfile(id);
        validateRequest(request, id);
        mapper.updateEntity(entity, request);
        ActingProfile saved = repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, saved));
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('actingprofile:write')")
    public void activate(UUID id) {
        ActingProfile entity = findProfile(id);
        entity.setStatus(StatusEnum.ACTIVE);
        repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.ACTIVATE, entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('actingprofile:write')")
    public void deactivate(UUID id) {
        ActingProfile entity = findProfile(id);
        entity.setStatus(StatusEnum.INACTIVE);
        repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.DEACTIVATE, entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('actingprofile:delete')")
    public void delete(UUID id) {
        ActingProfile entity = findProfile(id);
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.DELETE, entity));
    }

    private ActingProfile findProfile(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ActingProfileException::notFound);
    }

    private void validateRequest(ActingProfileRequestDto request, UUID currentId) {
        if (!accessScopePolicy.isSystemContracted(request.getSystem())) {
            throw ActingProfileException.systemNotContracted();
        }
        if (request.getDataScope() == DataScopeEnum.DEPARTMENT && request.getScopeRef() == null) {
            throw ActingProfileException.scopeRefRequired();
        }
        String name = request.getName() == null ? "" : request.getName().trim();
        boolean duplicate = currentId == null
                ? repository.existsByNameIgnoreCaseAndSystemAndStatusNot(name, request.getSystem(), StatusEnum.DELETED)
                : repository.existsByNameIgnoreCaseAndSystemAndStatusNotAndIdNot(
                        name, request.getSystem(), StatusEnum.DELETED, currentId);
        if (duplicate) {
            throw ActingProfileException.duplicateName();
        }
    }
}
