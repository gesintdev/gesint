package br.com.gommo.modules.payroll.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.dto.PayrollRunRequestDto;
import br.com.gommo.modules.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.payroll.entity.PayrollRun;
import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import br.com.gommo.modules.payroll.exception.PayrollRunException;
import br.com.gommo.modules.payroll.lifecycle.PayrollRunLockService;
import br.com.gommo.modules.payroll.lifecycle.PayrollRunStateMachine;
import br.com.gommo.modules.payroll.mapper.PayrollRunMapper;
import br.com.gommo.modules.payroll.repository.PayrollRunRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class PayrollRunService extends BaseService<PayrollRun, PayrollRunRequestDto, PayrollRunResponseDto> implements IPayrollRunService {
    private final PayrollRunRepository repository;
    private final PayrollRunMapper mapper;
    private final PayrollRunLockService payrollRunLockService;

    public PayrollRunService(
            PayrollRunRepository repository,
            PayrollRunMapper mapper,
            PayrollRunLockService payrollRunLockService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.payrollRunLockService = payrollRunLockService;
    }

    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payroll:read')") public List<PayrollRunResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payroll:read')") public PayrollRunResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('payroll:read')") public PageableResponseDto<PayrollRunResponseDto> findPage(int page, int size) { return super.findPage(page, size); }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto create(PayrollRunRequestDto request) {
        PayrollRun entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        entity.setPayrollStatus(PayrollStatusEnum.OPEN);
        if (entity.getOpenedAt() == null) {
            entity.setOpenedAt(OffsetDateTime.now());
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto update(UUID id, PayrollRunRequestDto request) {
        PayrollRun entity = findEntity(id);
        PayrollRunStateMachine.assertWritable(entity.getPayrollStatus());
        mapper.updateEditableFields(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:delete')")
    public void delete(UUID id) {
        PayrollRun entity = findEntity(id);
        if (entity.getPayrollStatus() != PayrollStatusEnum.OPEN) {
            throw PayrollRunException.invalidTransition();
        }
        super.delete(id);
    }

    @Override protected PayrollRun findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PayrollRunException::notFound); }
    @Override protected void updateEntity(PayrollRun entity, PayrollRunRequestDto request) { mapper.updateEditableFields(entity, request); }
}
