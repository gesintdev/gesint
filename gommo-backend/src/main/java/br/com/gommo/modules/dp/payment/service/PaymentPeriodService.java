package br.com.gommo.modules.dp.payment.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.payment.dto.PaymentPeriodRequestDto;
import br.com.gommo.modules.dp.payment.dto.PaymentPeriodResponseDto;
import br.com.gommo.modules.dp.payment.entity.PaymentPeriod;
import br.com.gommo.modules.dp.payment.exception.PaymentException;
import br.com.gommo.modules.dp.payment.mapper.PaymentMapper;
import br.com.gommo.modules.dp.payment.repository.PaymentPeriodRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentPeriodService extends BaseService<PaymentPeriod, PaymentPeriodRequestDto, PaymentPeriodResponseDto>
        implements IPaymentPeriodService {

    private final PaymentPeriodRepository repository;
    private final PaymentMapper mapper;

    public PaymentPeriodService(PaymentPeriodRepository repository, PaymentMapper mapper) {
        super(repository, mapper::toPeriodResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payment:read')")
    public List<PaymentPeriodResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payment:read')")
    public PaymentPeriodResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payment:read')")
    public PageableResponseDto<PaymentPeriodResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentPeriodResponseDto create(PaymentPeriodRequestDto request) {
        repository
                .findByReferenceDateAndStatusNot(request.getReferenceDate(), StatusEnum.DELETED)
                .ifPresent(existing -> {
                    throw PaymentException.periodDuplicate();
                });
        PaymentPeriod entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        return mapper.toPeriodResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentPeriodResponseDto update(UUID id, PaymentPeriodRequestDto request) {
        PaymentPeriod entity = findEntity(id);
        repository
                .findByReferenceDateAndStatusNot(request.getReferenceDate(), StatusEnum.DELETED)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw PaymentException.periodDuplicate();
                    }
                });
        mapper.updatePeriod(entity, request);
        return mapper.toPeriodResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected PaymentPeriod findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(PaymentException::notFound);
    }

    @Override
    protected void updateEntity(PaymentPeriod entity, PaymentPeriodRequestDto request) {
        mapper.updatePeriod(entity, request);
    }
}
