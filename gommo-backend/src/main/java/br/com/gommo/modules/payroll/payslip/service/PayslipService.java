package br.com.gommo.modules.payroll.payslip.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.lifecycle.PayrollRunLockService;
import br.com.gommo.modules.payroll.payslip.dto.PayslipRequestDto;
import br.com.gommo.modules.payroll.payslip.dto.PayslipResponseDto;
import br.com.gommo.modules.payroll.payslip.entity.Payslip;
import br.com.gommo.modules.payroll.payslip.exception.PayslipException;
import br.com.gommo.modules.payroll.payslip.mapper.PayslipMapper;
import br.com.gommo.modules.payroll.payslip.repository.PayslipRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class PayslipService extends BaseService<Payslip, PayslipRequestDto, PayslipResponseDto> implements IPayslipService {
    private final PayslipRepository repository;
    private final PayslipMapper mapper;
    private final PayrollRunLockService payrollRunLockService;

    public PayslipService(
            PayslipRepository repository,
            PayslipMapper mapper,
            PayrollRunLockService payrollRunLockService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.payrollRunLockService = payrollRunLockService;
    }

    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payslip:read')") public List<PayslipResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payslip:read')") public PayslipResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payslip:read')") public PageableResponseDto<PayslipResponseDto> findPage(int page, int size) { return super.findPage(page, size); }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:write')")
    public PayslipResponseDto create(PayslipRequestDto request) {
        payrollRunLockService.requireWritable(request.getPayrollRunId());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:write')")
    public PayslipResponseDto update(UUID id, PayslipRequestDto request) {
        Payslip entity = findEntity(id);
        payrollRunLockService.requireWritable(entity.getPayrollRunId());
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:delete')")
    public void delete(UUID id) {
        Payslip entity = findEntity(id);
        payrollRunLockService.requireWritable(entity.getPayrollRunId());
        super.delete(id);
    }

    @Override protected Payslip findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PayslipException::notFound); }
    @Override protected void updateEntity(Payslip entity, PayslipRequestDto request) { mapper.updateEntity(entity, request); }
}
