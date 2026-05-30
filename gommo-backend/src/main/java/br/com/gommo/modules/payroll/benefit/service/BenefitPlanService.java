package br.com.gommo.modules.payroll.benefit.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.benefit.dto.BenefitPlanRequestDto;
import br.com.gommo.modules.payroll.benefit.dto.BenefitPlanResponseDto;
import br.com.gommo.modules.payroll.benefit.entity.BenefitPlan;
import br.com.gommo.modules.payroll.benefit.exception.BenefitPlanException;
import br.com.gommo.modules.payroll.benefit.mapper.BenefitPlanMapper;
import br.com.gommo.modules.payroll.benefit.repository.BenefitPlanRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class BenefitPlanService extends BaseService<BenefitPlan, BenefitPlanRequestDto, BenefitPlanResponseDto> implements IBenefitPlanService {
    private final BenefitPlanRepository repository;
    private final BenefitPlanMapper mapper;
    public BenefitPlanService(BenefitPlanRepository repository, BenefitPlanMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefit:read')") public List<BenefitPlanResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefit:read')") public BenefitPlanResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefit:read')") public PageableResponseDto<BenefitPlanResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefit:write')") public BenefitPlanResponseDto create(BenefitPlanRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefit:write')") public BenefitPlanResponseDto update(UUID id, BenefitPlanRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefit:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected BenefitPlan findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(BenefitPlanException::notFound); }
    @Override protected void updateEntity(BenefitPlan entity, BenefitPlanRequestDto request) { mapper.updateEntity(entity, request); }
}
