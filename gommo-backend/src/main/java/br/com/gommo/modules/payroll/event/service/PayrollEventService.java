package br.com.gommo.modules.payroll.event.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.event.dto.PayrollEventRequestDto;
import br.com.gommo.modules.payroll.event.dto.PayrollEventResponseDto;
import br.com.gommo.modules.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.payroll.event.exception.PayrollEventException;
import br.com.gommo.modules.payroll.event.mapper.PayrollEventMapper;
import br.com.gommo.modules.payroll.event.repository.PayrollEventRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PayrollEventService extends BaseService<PayrollEvent, PayrollEventRequestDto, PayrollEventResponseDto>
        implements IPayrollEventService {

    private final PayrollEventRepository repository;
    private final PayrollEventMapper mapper;

    public PayrollEventService(PayrollEventRepository repository, PayrollEventMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payrollevent:read')")
    public List<PayrollEventResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payrollevent:read')")
    public PayrollEventResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payrollevent:read')")
    public PageableResponseDto<PayrollEventResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payrollevent:write')")
    public PayrollEventResponseDto create(PayrollEventRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payrollevent:write')")
    public PayrollEventResponseDto update(UUID id, PayrollEventRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payrollevent:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected PayrollEvent findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PayrollEventException::notFound);
    }

    @Override
    protected void updateEntity(PayrollEvent entity, PayrollEventRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
