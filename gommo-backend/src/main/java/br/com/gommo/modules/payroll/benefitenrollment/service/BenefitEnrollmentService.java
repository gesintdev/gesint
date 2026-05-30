package br.com.gommo.modules.payroll.benefitenrollment.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentRequestDto;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentResponseDto;
import br.com.gommo.modules.payroll.benefitenrollment.entity.BenefitEnrollment;
import br.com.gommo.modules.payroll.benefitenrollment.exception.BenefitEnrollmentException;
import br.com.gommo.modules.payroll.benefitenrollment.mapper.BenefitEnrollmentMapper;
import br.com.gommo.modules.payroll.benefitenrollment.repository.BenefitEnrollmentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class BenefitEnrollmentService extends BaseService<BenefitEnrollment, BenefitEnrollmentRequestDto, BenefitEnrollmentResponseDto> implements IBenefitEnrollmentService {
    private final BenefitEnrollmentRepository repository;
    private final BenefitEnrollmentMapper mapper;
    public BenefitEnrollmentService(BenefitEnrollmentRepository repository, BenefitEnrollmentMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefitenrollment:read')") public List<BenefitEnrollmentResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefitenrollment:read')") public BenefitEnrollmentResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('benefitenrollment:read')") public PageableResponseDto<BenefitEnrollmentResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefitenrollment:write')") public BenefitEnrollmentResponseDto create(BenefitEnrollmentRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefitenrollment:write')") public BenefitEnrollmentResponseDto update(UUID id, BenefitEnrollmentRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('benefitenrollment:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected BenefitEnrollment findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(BenefitEnrollmentException::notFound); }
    @Override protected void updateEntity(BenefitEnrollment entity, BenefitEnrollmentRequestDto request) { mapper.updateEntity(entity, request); }
}
