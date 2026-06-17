package br.com.gommo.modules.person.leave.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.person.leave.domain.VacationAbsenceCalculator;
import br.com.gommo.modules.person.leave.domain.VacationRules;
import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.dto.VacationAbsenceSummaryDto;
import br.com.gommo.modules.person.leave.dto.VacationReviewRequestDto;
import br.com.gommo.modules.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.person.leave.entity.VacationReviewActionEnum;
import br.com.gommo.modules.person.leave.entity.VacationReviewStatusEnum;
import br.com.gommo.modules.person.leave.exception.LeaveRequestException;
import br.com.gommo.modules.person.leave.exception.LeaveRequestExceptions;
import br.com.gommo.modules.person.leave.mapper.LeaveRequestMapper;
import br.com.gommo.modules.person.leave.repository.LeaveRequestRepository;

@Service
public class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestRequestDto, LeaveRequestResponseDto>
        implements ILeaveRequestService {

    private final LeaveRequestRepository repository;
    private final LeaveRequestMapper mapper;
    private final CollaboratorRepository collaboratorRepository;

    public LeaveRequestService(
            LeaveRequestRepository repository,
            LeaveRequestMapper mapper,
            CollaboratorRepository collaboratorRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public List<LeaveRequestResponseDto> findAll() {
        List<LeaveRequest> entities = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
        Map<UUID, String> collaboratorNames = collaboratorNamesById(entities.stream()
                .map(LeaveRequest::getCollaboratorId)
                .distinct()
                .toList());
        return entities.stream()
                .map(entity -> mapper.toResponse(entity, collaboratorNames.get(entity.getCollaboratorId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public LeaveRequestResponseDto findById(UUID id) {
        LeaveRequest entity = findEntity(id);
        return mapper.toResponse(entity, resolveCollaboratorName(entity.getCollaboratorId()));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public PageableResponseDto<LeaveRequestResponseDto> findPage(int page, int size) {
        PageableResponseDto<LeaveRequestResponseDto> pageResult = super.findPage(page, size);
        List<LeaveRequestResponseDto> content = pageResult.getContent();
        if (content.isEmpty()) {
            return pageResult;
        }
        Map<UUID, String> collaboratorNames = collaboratorNamesById(content.stream()
                .map(LeaveRequestResponseDto::getCollaboratorId)
                .distinct()
                .toList());
        Map<UUID, LeaveRequest> entitiesById =
                repository
                        .findAllById(content.stream()
                                .map(LeaveRequestResponseDto::getId)
                                .toList())
                        .stream()
                        .filter(entity -> entity.getStatus() != StatusEnum.DELETED)
                        .collect(Collectors.toMap(LeaveRequest::getId, Function.identity()));
        List<LeaveRequestResponseDto> enriched = content.stream()
                .map(dto -> mapper.toResponse(
                        entitiesById.get(dto.getId()), collaboratorNames.get(dto.getCollaboratorId())))
                .toList();
        return PageableResponseDto.<LeaveRequestResponseDto>builder()
                .content(enriched)
                .page(pageResult.getPage())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto create(LeaveRequestRequestDto request) {
        validateRequest(request);
        LeaveRequest entity = mapper.toEntity(request);
        applyVacationDefaultsOnCreate(entity, request);
        LeaveRequest saved = repository.save(entity);
        return findById(saved.getId());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public VacationAbsenceSummaryDto absenceSummary(
            UUID collaboratorId, LocalDate acquisitionStart, LocalDate acquisitionEnd) {
        if (acquisitionEnd.isBefore(acquisitionStart)) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_INVALID_DATES_MSG);
        }
        List<LeaveRequest> leaves =
                repository.findApprovedAbsencesOverlapping(
                        collaboratorId,
                        LeaveTypeEnum.VACATION,
                        acquisitionStart,
                        acquisitionEnd,
                        StatusEnum.DELETED);
        VacationAbsenceCalculator.Summary summary =
                VacationAbsenceCalculator.summarize(leaves, acquisitionStart, acquisitionEnd);
        return VacationAbsenceSummaryDto.builder()
                .unjustifiedAbsences(summary.unjustifiedAbsences())
                .justifiedAbsences(summary.justifiedAbsences())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto reviewVacation(UUID id, VacationReviewRequestDto request) {
        LeaveRequest entity = findEntity(id);
        if (entity.getLeaveType() != LeaveTypeEnum.VACATION) {
            throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_NOT_VACATION_MSG);
        }
        switch (request.getAction()) {
            case APPROVE -> {
                entity.setApproved(true);
                entity.setReviewStatus(VacationReviewStatusEnum.APPROVED);
                entity.setReviewReason(null);
            }
            case RETURN -> {
                String reason = requireReviewReason(request.getReason());
                entity.setApproved(false);
                entity.setReviewStatus(VacationReviewStatusEnum.RETURNED);
                entity.setReviewReason(reason);
            }
            case REJECT -> {
                String reason = requireReviewReason(request.getReason());
                entity.setApproved(false);
                entity.setReviewStatus(VacationReviewStatusEnum.REJECTED);
                entity.setReviewReason(reason);
            }
            default -> throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_INVALID_CODE);
        }
        repository.save(entity);
        return findById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto update(UUID id, LeaveRequestRequestDto request) {
        validateRequest(request);
        LeaveRequestResponseDto updated = super.update(id, request);
        return findById(updated.getId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected LeaveRequest findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(LeaveRequestException::notFound);
    }

    @Override
    protected void updateEntity(LeaveRequest entity, LeaveRequestRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void applyVacationDefaultsOnCreate(LeaveRequest entity, LeaveRequestRequestDto request) {
        LeaveTypeEnum type = request.getLeaveType() != null ? request.getLeaveType() : LeaveTypeEnum.VACATION;
        if (type != LeaveTypeEnum.VACATION) {
            return;
        }
        if (!Boolean.TRUE.equals(request.getApproved()) && entity.getReviewStatus() == null) {
            entity.setReviewStatus(VacationReviewStatusEnum.PENDING);
        }
        if (Boolean.TRUE.equals(request.getApproved()) && entity.getReviewStatus() == null) {
            entity.setReviewStatus(VacationReviewStatusEnum.APPROVED);
        }
    }

    private static String requireReviewReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_REASON_REQUIRED_MSG);
        }
        return reason.trim();
    }

    private void validateRequest(LeaveRequestRequestDto request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_INVALID_DATES_MSG);
        }

        LeaveTypeEnum type = request.getLeaveType() != null ? request.getLeaveType() : LeaveTypeEnum.VACATION;
        if (type != LeaveTypeEnum.VACATION) {
            return;
        }

        int absences = request.getUnjustifiedAbsences() != null ? request.getUnjustifiedAbsences() : 0;
        int entitled = request.getVacationDaysEntitled() != null
                ? request.getVacationDaysEntitled()
                : VacationRules.vacationDaysEntitled(absences);

        if (entitled <= 0) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_NO_ENTITLEMENT_MSG);
        }

        int pecuniary = request.getPecuniaryAllowanceDays() != null ? request.getPecuniaryAllowanceDays() : 0;
        if (pecuniary < 0 || pecuniary > VacationRules.maxPecuniaryDays(entitled)) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_PECUNIARY_EXCEEDED_MSG);
        }

        int usedDays = VacationRules.inclusiveDays(request.getStartDate(), request.getEndDate());
        if (usedDays + pecuniary > entitled) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_DAYS_EXCEEDED_MSG);
        }

        if (VacationRules.isRestrictedVacationStart(request.getStartDate())) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_START_RESTRICTED_MSG);
        }
    }

    private Map<UUID, String> collaboratorNamesById(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Collaborator::getId, Collaborator::getFullName, (a, b) -> a));
    }

    private String resolveCollaboratorName(UUID collaboratorId) {
        return collaboratorNamesById(List.of(collaboratorId)).get(collaboratorId);
    }
}
