package br.com.gommo.modules.person.contract.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.contract.dto.EmploymentContractRequestDto;
import br.com.gommo.modules.person.contract.dto.EmploymentContractResponseDto;
import br.com.gommo.modules.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.person.contract.exception.EmploymentContractException;
import br.com.gommo.modules.person.contract.mapper.EmploymentContractMapper;
import br.com.gommo.modules.person.contract.repository.EmploymentContractRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class EmploymentContractService extends BaseService<EmploymentContract, EmploymentContractRequestDto, EmploymentContractResponseDto> implements IEmploymentContractService {
    private final EmploymentContractRepository repository;
    private final EmploymentContractMapper mapper;
    public EmploymentContractService(EmploymentContractRepository repository, EmploymentContractMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('contract:read')") public List<EmploymentContractResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('contract:read')") public EmploymentContractResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('contract:read')") public PageableResponseDto<EmploymentContractResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('contract:write')") public EmploymentContractResponseDto create(EmploymentContractRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('contract:write')") public EmploymentContractResponseDto update(UUID id, EmploymentContractRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('contract:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected EmploymentContract findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(EmploymentContractException::notFound); }
    @Override protected void updateEntity(EmploymentContract entity, EmploymentContractRequestDto request) { mapper.updateEntity(entity, request); }
}
