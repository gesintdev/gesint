package br.com.gommo.modules.payroll.tax.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.tax.dto.TaxObligationRequestDto;
import br.com.gommo.modules.payroll.tax.dto.TaxObligationResponseDto;
import br.com.gommo.modules.payroll.tax.entity.TaxObligation;
import br.com.gommo.modules.payroll.tax.exception.TaxObligationException;
import br.com.gommo.modules.payroll.tax.mapper.TaxObligationMapper;
import br.com.gommo.modules.payroll.tax.repository.TaxObligationRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class TaxObligationService extends BaseService<TaxObligation, TaxObligationRequestDto, TaxObligationResponseDto> implements ITaxObligationService {
    private final TaxObligationRepository repository;
    private final TaxObligationMapper mapper;
    public TaxObligationService(TaxObligationRepository repository, TaxObligationMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('tax:read')") public List<TaxObligationResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('tax:read')") public TaxObligationResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('tax:read')") public PageableResponseDto<TaxObligationResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('tax:write')") public TaxObligationResponseDto create(TaxObligationRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('tax:write')") public TaxObligationResponseDto update(UUID id, TaxObligationRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('tax:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected TaxObligation findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(TaxObligationException::notFound); }
    @Override protected void updateEntity(TaxObligation entity, TaxObligationRequestDto request) { mapper.updateEntity(entity, request); }
}
