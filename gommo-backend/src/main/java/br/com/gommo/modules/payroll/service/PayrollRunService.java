package br.com.gommo.modules.payroll.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.dto.PayrollRunRequestDto;
import br.com.gommo.modules.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.payroll.entity.PayrollRun;
import br.com.gommo.modules.payroll.exception.PayrollRunException;
import br.com.gommo.modules.payroll.mapper.PayrollRunMapper;
import br.com.gommo.modules.payroll.repository.PayrollRunRepository;

@Service
public class PayrollRunService extends BaseService<PayrollRun, PayrollRunRequestDto, PayrollRunResponseDto>
        implements IPayrollRunService {
    private final PayrollRunRepository repository;
    private final PayrollRunMapper mapper;

    public PayrollRunService(PayrollRunRepository repository, PayrollRunMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payroll:read')")
    public List<PayrollRunResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payroll:read')")
    public PayrollRunResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payroll:read')")
    public PageableResponseDto<PayrollRunResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto create(PayrollRunRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto update(UUID id, PayrollRunRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected PayrollRun findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PayrollRunException::notFound);
    }

    @Override
    protected void updateEntity(PayrollRun entity, PayrollRunRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
