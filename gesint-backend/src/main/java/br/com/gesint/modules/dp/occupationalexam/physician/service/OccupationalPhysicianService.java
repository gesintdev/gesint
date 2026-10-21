package br.com.gesint.modules.dp.occupationalexam.physician.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.clinic.entity.MedicalClinic;
import br.com.gesint.modules.dp.occupationalexam.clinic.repository.MedicalClinicRepository;
import br.com.gesint.modules.dp.occupationalexam.physician.dto.OccupationalPhysicianRequestDto;
import br.com.gesint.modules.dp.occupationalexam.physician.dto.OccupationalPhysicianResponseDto;
import br.com.gesint.modules.dp.occupationalexam.physician.entity.OccupationalPhysician;
import br.com.gesint.modules.dp.occupationalexam.physician.entity.OccupationalPhysicianClinic;
import br.com.gesint.modules.dp.occupationalexam.physician.exception.OccupationalPhysicianException;
import br.com.gesint.modules.dp.occupationalexam.physician.mapper.OccupationalPhysicianMapper;
import br.com.gesint.modules.dp.occupationalexam.physician.repository.OccupationalPhysicianClinicRepository;
import br.com.gesint.modules.dp.occupationalexam.physician.repository.OccupationalPhysicianRepository;

@Service
public class OccupationalPhysicianService
        extends BaseService<OccupationalPhysician, OccupationalPhysicianRequestDto, OccupationalPhysicianResponseDto>
        implements IOccupationalPhysicianService {

    private final OccupationalPhysicianRepository repository;
    private final OccupationalPhysicianClinicRepository clinicLinkRepository;
    private final MedicalClinicRepository medicalClinicRepository;
    private final OccupationalPhysicianMapper mapper;

    public OccupationalPhysicianService(
            OccupationalPhysicianRepository repository,
            OccupationalPhysicianClinicRepository clinicLinkRepository,
            MedicalClinicRepository medicalClinicRepository,
            OccupationalPhysicianMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.clinicLinkRepository = clinicLinkRepository;
        this.medicalClinicRepository = medicalClinicRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalPhysicianResponseDto> findAll() {
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalPhysicianResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = resolveListStatus(status);
        List<OccupationalPhysician> entities =
                repository.findAllByStatusOrderByCreatedAtDesc(resolved);
        return toResponses(entities);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public OccupationalPhysicianResponseDto findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<OccupationalPhysicianResponseDto> findPage(int page, int size) {
        PageableResponseDto<OccupationalPhysicianResponseDto> pageResult = super.findPage(page, size);
        List<UUID> ids = pageResult.getContent().stream()
                .map(OccupationalPhysicianResponseDto::getId)
                .toList();
        Map<UUID, List<UUID>> clinicIdsByPhysician = clinicIdsByPhysician(ids);
        List<OccupationalPhysicianResponseDto> enriched = pageResult.getContent().stream()
                .map(item -> OccupationalPhysicianResponseDto.builder()
                        .id(item.getId())
                        .code(item.getCode())
                        .status(item.getStatus())
                        .fullName(item.getFullName())
                        .crm(item.getCrm())
                        .crmState(item.getCrmState())
                        .role(item.getRole())
                        .clinicIds(clinicIdsByPhysician.getOrDefault(item.getId(), List.of()))
                        .phone(item.getPhone())
                        .email(item.getEmail())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .build())
                .toList();
        return PageableResponseDto.<OccupationalPhysicianResponseDto>builder()
                .content(enriched)
                .page(pageResult.getPage())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .filterOptions(pageResult.getFilterOptions())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalPhysicianResponseDto create(OccupationalPhysicianRequestDto request) {
        OccupationalPhysician entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        OccupationalPhysician saved = repository.save(entity);
        replaceClinicLinks(saved.getId(), request.getClinicIds());
        return toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalPhysicianResponseDto update(UUID id, OccupationalPhysicianRequestDto request) {
        OccupationalPhysician entity = findEntity(id);
        mapper.updateEntity(entity, request);
        OccupationalPhysician saved = repository.save(entity);
        replaceClinicLinks(saved.getId(), request.getClinicIds());
        return toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:delete')")
    public void delete(UUID id) {
        clinicLinkRepository.deleteByPhysicianId(id);
        super.delete(id);
    }

    @Override
    protected OccupationalPhysician findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(OccupationalPhysicianException::notFound);
    }

    @Override
    protected void updateEntity(OccupationalPhysician entity, OccupationalPhysicianRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private OccupationalPhysicianResponseDto toResponse(OccupationalPhysician entity) {
        List<UUID> clinicIds = clinicLinkRepository.findByPhysicianId(entity.getId()).stream()
                .map(OccupationalPhysicianClinic::getClinicId)
                .toList();
        return mapper.toResponse(entity, clinicIds);
    }

    private List<OccupationalPhysicianResponseDto> toResponses(List<OccupationalPhysician> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = entities.stream().map(OccupationalPhysician::getId).toList();
        Map<UUID, List<UUID>> clinicIdsByPhysician = clinicIdsByPhysician(ids);
        return entities.stream()
                .map(entity -> mapper.toResponse(
                        entity, clinicIdsByPhysician.getOrDefault(entity.getId(), List.of())))
                .toList();
    }

    private Map<UUID, List<UUID>> clinicIdsByPhysician(List<UUID> physicianIds) {
        if (physicianIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, List<UUID>> result = new HashMap<>();
        for (OccupationalPhysicianClinic link : clinicLinkRepository.findByPhysicianIdIn(physicianIds)) {
            result.computeIfAbsent(link.getPhysicianId(), ignored -> new ArrayList<>()).add(link.getClinicId());
        }
        return result;
    }

    private void replaceClinicLinks(UUID physicianId, List<UUID> clinicIds) {
        List<UUID> normalized = normalizeClinicIds(clinicIds);
        validateClinicsExist(normalized);
        clinicLinkRepository.deleteByPhysicianId(physicianId);
        OffsetDateTime now = OffsetDateTime.now();
        List<OccupationalPhysicianClinic> links = normalized.stream()
                .map(clinicId -> OccupationalPhysicianClinic.builder()
                        .physicianId(physicianId)
                        .clinicId(clinicId)
                        .createdAt(now)
                        .build())
                .toList();
        if (!links.isEmpty()) {
            clinicLinkRepository.saveAll(links);
        }
    }

    private static List<UUID> normalizeClinicIds(List<UUID> clinicIds) {
        if (clinicIds == null || clinicIds.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(new LinkedHashSet<>(clinicIds.stream().filter(id -> id != null).toList()));
    }

    private void validateClinicsExist(List<UUID> clinicIds) {
        if (clinicIds.isEmpty()) {
            return;
        }
        Set<UUID> found = medicalClinicRepository
                .findAllByIdInAndStatus(new HashSet<>(clinicIds), StatusEnum.ACTIVE)
                .stream()
                .map(MedicalClinic::getId)
                .collect(Collectors.toSet());
        if (found.size() != clinicIds.size()) {
            throw OccupationalPhysicianException.clinicNotFound();
        }
    }
}
