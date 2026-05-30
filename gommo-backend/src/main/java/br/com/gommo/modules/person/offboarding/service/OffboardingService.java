package br.com.gommo.modules.person.offboarding.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.person.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.person.offboarding.entity.Offboarding;
import br.com.gommo.modules.person.offboarding.exception.OffboardingException;
import br.com.gommo.modules.person.offboarding.mapper.OffboardingMapper;
import br.com.gommo.modules.person.offboarding.repository.OffboardingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class OffboardingService extends BaseService<Offboarding, OffboardingRequestDto, OffboardingResponseDto> implements IOffboardingService {
    private final OffboardingRepository repository;
    private final OffboardingMapper mapper;
    public OffboardingService(OffboardingRepository repository, OffboardingMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('offboarding:read')") public List<OffboardingResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('offboarding:read')") public OffboardingResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('offboarding:read')") public PageableResponseDto<OffboardingResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('offboarding:write')") public OffboardingResponseDto create(OffboardingRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('offboarding:write')") public OffboardingResponseDto update(UUID id, OffboardingRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('offboarding:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected Offboarding findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(OffboardingException::notFound); }
    @Override protected void updateEntity(Offboarding entity, OffboardingRequestDto request) { mapper.updateEntity(entity, request); }
}
