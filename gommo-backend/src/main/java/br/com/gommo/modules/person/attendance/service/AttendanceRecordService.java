package br.com.gommo.modules.person.attendance.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.attendance.dto.AttendanceRecordRequestDto;
import br.com.gommo.modules.person.attendance.dto.AttendanceRecordResponseDto;
import br.com.gommo.modules.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.person.attendance.exception.AttendanceRecordException;
import br.com.gommo.modules.person.attendance.mapper.AttendanceRecordMapper;
import br.com.gommo.modules.person.attendance.repository.AttendanceRecordRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AttendanceRecordService extends BaseService<AttendanceRecord, AttendanceRecordRequestDto, AttendanceRecordResponseDto> implements IAttendanceRecordService {
    private final AttendanceRecordRepository repository;
    private final AttendanceRecordMapper mapper;
    public AttendanceRecordService(AttendanceRecordRepository repository, AttendanceRecordMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('attendance:read')") public List<AttendanceRecordResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('attendance:read')") public AttendanceRecordResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('attendance:read')") public PageableResponseDto<AttendanceRecordResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('attendance:write')") public AttendanceRecordResponseDto create(AttendanceRecordRequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('attendance:write')") public AttendanceRecordResponseDto update(UUID id, AttendanceRecordRequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('attendance:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected AttendanceRecord findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(AttendanceRecordException::notFound); }
    @Override protected void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto request) { mapper.updateEntity(entity, request); }
}
