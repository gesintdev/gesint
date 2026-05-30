package br.com.gommo.modules.person.exitinterview.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.person.exitinterview.dto.ExitInterviewResponseDto;
import br.com.gommo.modules.person.exitinterview.entity.ExitInterview;
import br.com.gommo.modules.person.exitinterview.exception.ExitInterviewException;
import br.com.gommo.modules.person.exitinterview.mapper.ExitInterviewMapper;
import br.com.gommo.modules.person.exitinterview.repository.ExitInterviewRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class ExitInterviewService extends BaseService<ExitInterview, ExitInterviewRequestDto, ExitInterviewResponseDto> implements IExitInterviewService {
    private final ExitInterviewRepository repository;
    private final ExitInterviewMapper mapper;
    public ExitInterviewService(ExitInterviewRepository repository, ExitInterviewMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('exitinterview:read')") public List<ExitInterviewResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('exitinterview:read')") public ExitInterviewResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('exitinterview:read')") public PageableResponseDto<ExitInterviewResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('exitinterview:write')") public ExitInterviewResponseDto create(ExitInterviewRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('exitinterview:write')") public ExitInterviewResponseDto update(UUID id, ExitInterviewRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('exitinterview:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected ExitInterview findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ExitInterviewException::notFound); }
    @Override protected void updateEntity(ExitInterview entity, ExitInterviewRequestDto request) { mapper.updateEntity(entity, request); }
}
