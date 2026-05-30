package br.com.gommo.modules.person.leave.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.person.leave.exception.LeaveRequestException;
import br.com.gommo.modules.person.leave.mapper.LeaveRequestMapper;
import br.com.gommo.modules.person.leave.repository.LeaveRequestRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestRequestDto, LeaveRequestResponseDto> implements ILeaveRequestService {
    private final LeaveRequestRepository repository;
    private final LeaveRequestMapper mapper;
    public LeaveRequestService(LeaveRequestRepository repository, LeaveRequestMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('leave:read')") public List<LeaveRequestResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('leave:read')") public LeaveRequestResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('leave:read')") public PageableResponseDto<LeaveRequestResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('leave:write')") public LeaveRequestResponseDto create(LeaveRequestRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('leave:write')") public LeaveRequestResponseDto update(UUID id, LeaveRequestRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('leave:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected LeaveRequest findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(LeaveRequestException::notFound); }
    @Override protected void updateEntity(LeaveRequest entity, LeaveRequestRequestDto request) { mapper.updateEntity(entity, request); }
}
