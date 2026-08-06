package br.com.gommo.modules.rh.person.occupationalexam.exam.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExam;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExamResultEnum;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.mapper.ComplementaryExamMapper;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.repository.ComplementaryExamRepository;
import br.com.gommo.modules.rh.person.occupationalexam.esocial.service.EsocialS2220Service;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamIndicatorsResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamRegisterResultRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamScheduleRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExam;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.exception.OccupationalExamException;
import br.com.gommo.modules.rh.person.occupationalexam.exam.exception.OccupationalExamExceptions;
import br.com.gommo.modules.rh.person.occupationalexam.exam.mapper.OccupationalExamMapper;
import br.com.gommo.modules.rh.person.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.entity.ExamRequirement;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.repository.ExamRequirementRepository;
import br.com.gommo.modules.rh.person.occupationalexam.physician.entity.OccupationalPhysician;
import br.com.gommo.modules.rh.person.occupationalexam.physician.exception.OccupationalPhysicianException;
import br.com.gommo.modules.rh.person.occupationalexam.physician.repository.OccupationalPhysicianRepository;

@Service
public class OccupationalExamService
        extends BaseService<OccupationalExam, OccupationalExamRequestDto, OccupationalExamResponseDto>
        implements IOccupationalExamService {

    private static final List<OccupationalExamLifecycleStatusEnum> ALERT_STATUSES =
            List.of(OccupationalExamLifecycleStatusEnum.PREVISTO, OccupationalExamLifecycleStatusEnum.CONVOCADO);

    private static final List<OccupationalExamLifecycleStatusEnum> CLOSED_STATUSES = List.of(
            OccupationalExamLifecycleStatusEnum.REGISTRADO,
            OccupationalExamLifecycleStatusEnum.TRANSMITIDO,
            OccupationalExamLifecycleStatusEnum.ARQUIVADO);

    private static final int DEFAULT_RETENTION_YEARS = 20;

    private final OccupationalExamRepository repository;
    private final OccupationalExamMapper mapper;
    private final ExamRequirementRepository examRequirementRepository;
    private final ComplementaryExamRepository complementaryExamRepository;
    private final ComplementaryExamMapper complementaryExamMapper;
    private final OccupationalPhysicianRepository physicianRepository;
    private final OccupationalExamTriggerService triggerService;
    private final OccupationalExamIndicatorsService indicatorsService;
    private final EsocialS2220Service esocialS2220Service;

    public OccupationalExamService(
            OccupationalExamRepository repository,
            OccupationalExamMapper mapper,
            ExamRequirementRepository examRequirementRepository,
            ComplementaryExamRepository complementaryExamRepository,
            ComplementaryExamMapper complementaryExamMapper,
            OccupationalPhysicianRepository physicianRepository,
            OccupationalExamTriggerService triggerService,
            OccupationalExamIndicatorsService indicatorsService,
            EsocialS2220Service esocialS2220Service) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.examRequirementRepository = examRequirementRepository;
        this.complementaryExamRepository = complementaryExamRepository;
        this.complementaryExamMapper = complementaryExamMapper;
        this.physicianRepository = physicianRepository;
        this.triggerService = triggerService;
        this.indicatorsService = indicatorsService;
        this.esocialS2220Service = esocialS2220Service;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalExamResponseDto> findAll() {
        return repository.findAllByStatusOrderByCreatedAtDesc(StatusEnum.ACTIVE).stream()
                .map(this::toSecureResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalExamResponseDto> findAll(StatusEnum status) {
        return super.findAll(status).stream()
                .map(dto -> toSecureResponse(findEntity(dto.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public OccupationalExamResponseDto findById(UUID id) {
        return toSecureResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<OccupationalExamResponseDto> findPage(int page, int size) {
        PageableResponseDto<OccupationalExamResponseDto> pageResult = super.findPage(page, size);
        List<OccupationalExamResponseDto> content = pageResult.getContent().stream()
                .map(dto -> toSecureResponse(findEntity(dto.getId())))
                .toList();
        return PageableResponseDto.<OccupationalExamResponseDto>builder()
                .content(content)
                .page(pageResult.getPage())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .filterOptions(pageResult.getFilterOptions())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalExamResponseDto> findDue(int days) {
        int window = days <= 0 ? 30 : days;
        LocalDate today = LocalDate.now();
        return repository.findDueInWindow(today, today.plusDays(window), ALERT_STATUSES, StatusEnum.DELETED).stream()
                .map(this::toSecureResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalExamResponseDto> findOverdue() {
        return repository.findOverdue(LocalDate.now(), CLOSED_STATUSES, StatusEnum.DELETED).stream()
                .map(this::toSecureResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public int markOverdueInadimplente() {
        return triggerService.markOverdueInadimplente(LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public OccupationalExamIndicatorsResponseDto indicators() {
        return indicatorsService.getIndicators();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalExamResponseDto create(OccupationalExamRequestDto request) {
        applyDueDateFromMatrix(request);
        OccupationalExam entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        if (entity.getLifecycleStatus() == null) {
            entity.setLifecycleStatus(OccupationalExamLifecycleStatusEnum.PREVISTO);
        }
        if (entity.getDismissalWaiverApplied() == null) {
            entity.setDismissalWaiverApplied(Boolean.FALSE);
        }
        OccupationalExam saved = repository.save(entity);
        syncComplementaryExams(saved, request.getComplementaryExams());
        return toSecureResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalExamResponseDto update(UUID id, OccupationalExamRequestDto request) {
        OccupationalExam entity = findEntity(id);
        assertMutable(entity);
        rejectManualDueDateOverride(request, entity.getJobPositionId(), entity.getExamType());
        LocalDate previousDueDate = entity.getDueDate();
        mapper.updateEntity(entity, request);
        entity.setDueDate(previousDueDate);
        OccupationalExam saved = repository.save(entity);
        syncComplementaryExams(saved, request.getComplementaryExams());
        return toSecureResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalExamResponseDto schedule(UUID id, OccupationalExamScheduleRequestDto request) {
        OccupationalExam entity = findEntity(id);
        if (entity.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.PREVISTO) {
            throw OccupationalExamException.scheduleInvalid();
        }
        entity.setScheduledDate(request.getScheduledDate());
        if (request.getClinicId() != null) {
            entity.setClinicId(request.getClinicId());
        }
        entity.setLifecycleStatus(OccupationalExamLifecycleStatusEnum.CONVOCADO);
        return toSecureResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalExamResponseDto registerResult(UUID id, OccupationalExamRegisterResultRequestDto request) {
        OccupationalExam entity = findEntity(id);
        // Fluxo enxuto: aceita CONVOCADO ou REALIZADO e fecha em REGISTRADO.
        if (entity.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.REALIZADO
                && entity.getLifecycleStatus() != OccupationalExamLifecycleStatusEnum.CONVOCADO) {
            throw OccupationalExamException.registerIncomplete(OccupationalExamExceptions.REGISTER_INVALID_STATUS_MSG);
        }

        OccupationalPhysician examiner = physicianRepository
                .findByIdAndStatusNot(request.getExaminerPhysicianId(), StatusEnum.DELETED)
                .orElseThrow(OccupationalPhysicianException::notFound);
        if (examiner.getCrm() == null
                || examiner.getCrm().isBlank()
                || examiner.getCrmState() == null
                || examiner.getCrmState().isBlank()) {
            throw OccupationalPhysicianException.crmRequired();
        }

        if (request.getResult() == OccupationalExamResultEnum.UNFIT
                && (request.getCid() == null || request.getCid().isBlank())) {
            throw OccupationalExamException.registerIncomplete(OccupationalExamExceptions.REGISTER_CID_REQUIRED_MSG);
        }

        syncComplementaryExams(entity, request.getComplementaryExams());
        assertComplementaryCompleteness(entity);

        entity.setExaminerPhysicianId(request.getExaminerPhysicianId());
        entity.setCoordinatorPhysicianId(request.getCoordinatorPhysicianId());
        if (request.getClinicId() != null) {
            entity.setClinicId(request.getClinicId());
        }
        entity.setClinicalExamDate(request.getClinicalExamDate());
        entity.setAsoIssueDate(
                request.getAsoIssueDate() != null ? request.getAsoIssueDate() : request.getClinicalExamDate());
        entity.setResult(request.getResult());
        entity.setCid(normalizeCid(request.getCid()));
        entity.setClinicalObservations(blankToNull(request.getClinicalObservations()));
        entity.setLifecycleStatus(OccupationalExamLifecycleStatusEnum.REGISTRADO);
        OccupationalExam saved = repository.save(entity);
        esocialS2220Service.ensurePendingEvent(saved);
        return toSecureResponse(saved);
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
        OccupationalExam entity = findEntity(id);
        if (entity.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.ARQUIVADO) {
            throw OccupationalExamException.immutable();
        }
        super.delete(id);
    }

    @Override
    protected OccupationalExam findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(OccupationalExamException::notFound);
    }

    @Override
    protected void updateEntity(OccupationalExam entity, OccupationalExamRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    /**
     * LGPD - minimizacao de acesso a dado de saude sensivel: CID, observacoes e
     * resultado de complementares so sao montados quando o usuario possui
     * {@code occupationalexam:clinical}. Checado no service, nao no controller.
     */
    private OccupationalExamResponseDto toSecureResponse(OccupationalExam entity) {
        boolean includeClinical = hasClinicalAuthority();
        List<ComplementaryExamResponseDto> complementary = List.of();
        if (includeClinical) {
            complementary =
                    complementaryExamRepository
                            .findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(entity.getId(), StatusEnum.DELETED)
                            .stream()
                            .map(item -> complementaryExamMapper.toResponse(item, true))
                            .toList();
        }
        return mapper.toResponse(entity, includeClinical, complementary);
    }

    private void applyDueDateFromMatrix(OccupationalExamRequestDto request) {
        Optional<ExamRequirement> matrix = examRequirementRepository.findVigente(
                request.getJobPositionId(), request.getExamType(), LocalDate.now());
        if (matrix.isPresent()) {
            if (request.getDueDate() != null) {
                throw OccupationalExamException.dueDateOverride();
            }
            ExamRequirement requirement = matrix.get();
            request.setExamRequirementVersionId(requirement.getId());
            if (requirement.getPeriodicityMonths() != null && requirement.getPeriodicityMonths() > 0) {
                LocalDate base = request.getClinicalExamDate() != null
                        ? request.getClinicalExamDate()
                        : (request.getScheduledDate() != null ? request.getScheduledDate() : LocalDate.now());
                request.setDueDate(base.plusMonths(requirement.getPeriodicityMonths()));
            }
        }
    }

    private void rejectManualDueDateOverride(
            OccupationalExamRequestDto request,
            UUID jobPositionId,
            br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum examType) {
        if (request.getDueDate() == null) {
            return;
        }
        Optional<ExamRequirement> matrix =
                examRequirementRepository.findVigente(jobPositionId, examType, LocalDate.now());
        if (matrix.isPresent()) {
            throw OccupationalExamException.dueDateOverride();
        }
    }

    private void assertMutable(OccupationalExam entity) {
        if (entity.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.REGISTRADO
                || entity.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.ARQUIVADO) {
            throw OccupationalExamException.immutable();
        }
    }

    private void syncComplementaryExams(OccupationalExam exam, List<ComplementaryExamRequestDto> items) {
        if (items == null) {
            return;
        }
        List<ComplementaryExam> existing =
                complementaryExamRepository.findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
                        exam.getId(), StatusEnum.DELETED);
        for (ComplementaryExam current : existing) {
            current.setStatus(StatusEnum.DELETED);
            complementaryExamRepository.save(current);
        }
        for (ComplementaryExamRequestDto item : items) {
            ComplementaryExamRequestDto payload = ComplementaryExamRequestDto.builder()
                    .occupationalExamId(exam.getId())
                    .procedureCode(item.getProcedureCode())
                    .performedDate(item.getPerformedDate())
                    .result(item.getResult())
                    .build();
            complementaryExamRepository.save(complementaryExamMapper.toEntity(payload));
        }
    }

    private void assertComplementaryCompleteness(OccupationalExam exam) {
        if (exam.getExamRequirementVersionId() == null) {
            return;
        }
        ExamRequirement requirement = examRequirementRepository
                .findByIdAndStatusNot(exam.getExamRequirementVersionId(), StatusEnum.DELETED)
                .orElse(null);
        if (requirement == null
                || requirement.getComplementaryProcedureCodes() == null
                || requirement.getComplementaryProcedureCodes().isEmpty()) {
            return;
        }
        Set<String> required = requirement.getComplementaryProcedureCodes().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .collect(Collectors.toSet());
        List<ComplementaryExam> performed =
                complementaryExamRepository.findByOccupationalExamIdAndStatusNotOrderByCreatedAtAsc(
                        exam.getId(), StatusEnum.DELETED);
        Set<String> completed = performed.stream()
                .filter(item ->
                        item.getResult() != null && item.getResult() != ComplementaryExamResultEnum.NOT_PERFORMED)
                .map(ComplementaryExam::getProcedureCode)
                .collect(Collectors.toSet());
        List<String> missing = new ArrayList<>();
        for (String code : required) {
            if (!completed.contains(code)) {
                missing.add(code);
            }
        }
        if (!missing.isEmpty()) {
            throw OccupationalExamException.registerIncomplete(
                    OccupationalExamExceptions.REGISTER_COMPLEMENTARY_REQUIRED_MSG
                            + " Faltando: "
                            + String.join(", ", missing));
        }
    }

    /**
     * Calcula retention_until com default de 20 anos (configuravel por chamada;
     * 40 anos para agentes cancerigenos fica como override explicito).
     */
    public LocalDate calculateRetentionUntil(LocalDate terminationDate, Integer retentionYearsOverride) {
        int years = retentionYearsOverride != null && retentionYearsOverride > 0
                ? retentionYearsOverride
                : DEFAULT_RETENTION_YEARS;
        LocalDate base = terminationDate != null ? terminationDate : LocalDate.now();
        return base.plusYears(years);
    }

    private static boolean hasClinicalAuthority() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("occupationalexam:clinical"::equals);
    }

    private static String normalizeCid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
