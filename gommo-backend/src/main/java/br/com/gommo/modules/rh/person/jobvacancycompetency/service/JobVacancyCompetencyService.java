package br.com.gommo.modules.rh.person.jobvacancycompetency.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gommo.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.entity.JobVacancyCompetency;
import br.com.gommo.modules.rh.person.jobvacancycompetency.exception.JobVacancyCompetencyException;
import br.com.gommo.modules.rh.person.jobvacancycompetency.mapper.JobVacancyCompetencyMapper;
import br.com.gommo.modules.rh.person.jobvacancycompetency.repository.JobVacancyCompetencyRepository;

@Service
public class JobVacancyCompetencyService
        extends BaseService<JobVacancyCompetency, JobVacancyCompetencyRequestDto, JobVacancyCompetencyResponseDto>
        implements IJobVacancyCompetencyService {

    private final JobVacancyCompetencyRepository repository;
    private final JobVacancyCompetencyMapper mapper;
    private final JobVacancyRepository jobVacancyRepository;
    private final CompetencyRepository competencyRepository;

    public JobVacancyCompetencyService(
            JobVacancyCompetencyRepository repository,
            JobVacancyCompetencyMapper mapper,
            JobVacancyRepository jobVacancyRepository,
            CompetencyRepository competencyRepository) {
        super(
                repository,
                entity -> mapper.toResponse(
                        entity,
                        competencyRepository
                                .findByIdAndStatusNot(entity.getCompetencyId(), StatusEnum.DELETED)
                                .orElse(null)),
                mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobVacancyRepository = jobVacancyRepository;
        this.competencyRepository = competencyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancy:read', 'jobvacancyapplication:read', 'admission:read')")
    public List<JobVacancyCompetencyResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancy:read', 'jobvacancyapplication:read', 'admission:read')")
    public List<JobVacancyCompetencyResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancy:read', 'jobvacancyapplication:read', 'admission:read')")
    public JobVacancyCompetencyResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancy:read', 'jobvacancyapplication:read', 'admission:read')")
    public PageableResponseDto<JobVacancyCompetencyResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancy:read', 'jobvacancyapplication:read', 'admission:read')")
    public List<JobVacancyCompetencyResponseDto> findByJobVacancyId(UUID jobVacancyId) {
        return repository.findByJobVacancyIdOrdered(jobVacancyId, StatusEnum.DELETED).stream()
                .map(entity -> mapper.toResponse(entity, resolveCompetency(entity.getCompetencyId())))
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyCompetencyResponseDto create(JobVacancyCompetencyRequestDto request) {
        JobVacancy vacancy = requireVacancy(request.getJobVacancyId());
        Competency competency = requireCompetency(request.getCompetencyId());
        repository
                .findByJobVacancyIdAndCompetencyIdAndStatusNot(
                        request.getJobVacancyId(), request.getCompetencyId(), StatusEnum.DELETED)
                .ifPresent(existing -> {
                    throw JobVacancyCompetencyException.duplicate();
                });

        JobVacancyCompetency entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        entity.setCompanyId(vacancy.getCompanyId());
        return mapper.toResponse(repository.save(entity), competency);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyCompetencyResponseDto update(UUID id, JobVacancyCompetencyRequestDto request) {
        JobVacancy vacancy = requireVacancy(request.getJobVacancyId());
        Competency competency = requireCompetency(request.getCompetencyId());
        JobVacancyCompetency entity = findEntity(id);

        repository
                .findByJobVacancyIdAndCompetencyIdAndStatusNot(
                        request.getJobVacancyId(), request.getCompetencyId(), StatusEnum.DELETED)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw JobVacancyCompetencyException.duplicate();
                });

        mapper.updateEntity(entity, request);
        entity.setCompanyId(vacancy.getCompanyId());
        return mapper.toResponse(repository.save(entity), competency);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobVacancyCompetency findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyCompetencyException::notFound);
    }

    @Override
    protected void updateEntity(JobVacancyCompetency entity, JobVacancyCompetencyRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private JobVacancy requireVacancy(UUID jobVacancyId) {
        return jobVacancyRepository
                .findByIdAndStatusNot(jobVacancyId, StatusEnum.DELETED)
                .orElseThrow(JobVacancyCompetencyException::vacancyNotFound);
    }

    private Competency requireCompetency(UUID competencyId) {
        return competencyRepository
                .findByIdAndStatusNot(competencyId, StatusEnum.DELETED)
                .orElseThrow(JobVacancyCompetencyException::competencyNotFound);
    }

    private Competency resolveCompetency(UUID competencyId) {
        return competencyRepository.findByIdAndStatusNot(competencyId, StatusEnum.DELETED).orElse(null);
    }
}
