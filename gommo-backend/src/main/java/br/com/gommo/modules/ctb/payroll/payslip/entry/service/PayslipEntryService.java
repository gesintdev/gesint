package br.com.gommo.modules.ctb.payroll.payslip.entry.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.ctb.payroll.lifecycle.PayrollRunLockService;
import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryRequestDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryResponseDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;
import br.com.gommo.modules.ctb.payroll.payslip.entry.exception.PayslipEntryException;
import br.com.gommo.modules.ctb.payroll.payslip.entry.mapper.PayslipEntryMapper;
import br.com.gommo.modules.ctb.payroll.payslip.entry.repository.PayslipEntryRepository;
import br.com.gommo.modules.ctb.payroll.payslip.entity.Payslip;
import br.com.gommo.modules.ctb.payroll.payslip.exception.PayslipException;
import br.com.gommo.modules.ctb.payroll.payslip.repository.PayslipRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PayslipEntryService extends BaseService<PayslipEntry, PayslipEntryRequestDto, PayslipEntryResponseDto>
        implements IPayslipEntryService {

    private final PayslipEntryRepository repository;
    private final PayslipEntryMapper mapper;
    private final PayslipRepository payslipRepository;
    private final PayrollRunLockService payrollRunLockService;

    public PayslipEntryService(
            PayslipEntryRepository repository,
            PayslipEntryMapper mapper,
            PayslipRepository payslipRepository,
            PayrollRunLockService payrollRunLockService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.payslipRepository = payslipRepository;
        this.payrollRunLockService = payrollRunLockService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payslip:read')")
    public List<PayslipEntryResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payslip:read')")
    public PayslipEntryResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payslip:read')")
    public PageableResponseDto<PayslipEntryResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:write')")
    public PayslipEntryResponseDto create(PayslipEntryRequestDto request) {
        assertWritablePayslip(request.getPayslipId());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:write')")
    public PayslipEntryResponseDto update(UUID id, PayslipEntryRequestDto request) {
        PayslipEntry entity = findEntity(id);
        assertWritablePayslip(entity.getPayslipId());
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payslip:delete')")
    public void delete(UUID id) {
        PayslipEntry entity = findEntity(id);
        assertWritablePayslip(entity.getPayslipId());
        super.delete(id);
    }

    @Override
    protected PayslipEntry findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PayslipEntryException::notFound);
    }

    @Override
    protected void updateEntity(PayslipEntry entity, PayslipEntryRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void assertWritablePayslip(UUID payslipId) {
        Payslip payslip = payslipRepository
                .findByIdAndStatusNot(payslipId, StatusEnum.DELETED)
                .orElseThrow(PayslipException::notFound);
        payrollRunLockService.requireWritable(payslip.getPayrollRunId());
    }
}
