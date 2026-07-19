package br.com.gommo.modules.rh.person.jobvacancy.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.exception.JobVacancyException;
import br.com.gommo.modules.rh.person.jobvacancy.mapper.JobVacancyMapper;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;

@Service
public class JobVacancyService extends BaseService<JobVacancy, JobVacancyRequestDto, JobVacancyResponseDto>
        implements IJobVacancyService {
    private final JobVacancyRepository repository;
    private final JobVacancyMapper mapper;
    private final JobPositionRepository jobPositionRepository;

    public JobVacancyService(
            JobVacancyRepository repository,
            JobVacancyMapper mapper,
            JobPositionRepository jobPositionRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public List<JobVacancyResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public JobVacancyResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public PageableResponseDto<JobVacancyResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyResponseDto create(JobVacancyRequestDto request) {
        validateRequest(request);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyResponseDto update(UUID id, JobVacancyRequestDto request) {
        validateRequest(request);
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobVacancy findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyException::notFound);
    }

    @Override
    protected void updateEntity(JobVacancy entity, JobVacancyRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void validateRequest(JobVacancyRequestDto request) {
        String title = request.getJobTitle() == null ? "" : request.getJobTitle().trim();
        if (title.isEmpty()) {
            throw JobVacancyException.titleRequired();
        }
        request.setJobTitle(title);

        if (request.getPositionsCount() == null || request.getPositionsCount() < 1) {
            throw JobVacancyException.positionsInvalid();
        }

        if (request.getJobPositionId() != null) {
            boolean exists = jobPositionRepository
                    .findByIdAndStatusNot(request.getJobPositionId(), StatusEnum.DELETED)
                    .isPresent();
            if (!exists) {
                throw JobVacancyException.jobPositionNotFound();
            }
        }
    }
}
