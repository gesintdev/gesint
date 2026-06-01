package br.com.gommo.modules.person.attendance.mapper;
import br.com.gommo.modules.person.attendance.dto.*; import br.com.gommo.modules.person.attendance.entity.AttendanceRecord; import org.springframework.stereotype.Component;
@Component public class AttendanceRecordMapper {
    public AttendanceRecord toEntity(AttendanceRecordRequestDto dto) {
        return AttendanceRecord.builder().collaboratorId(dto.getCollaboratorId()).workDate(dto.getWorkDate())
            .clockIn(dto.getClockIn()).clockOut(dto.getClockOut()).breakMinutes(dto.getBreakMinutes()).notes(dto.getNotes()).build();
    }
    public void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setWorkDate(dto.getWorkDate());
        entity.setClockIn(dto.getClockIn()); entity.setClockOut(dto.getClockOut());
        entity.setBreakMinutes(dto.getBreakMinutes()); entity.setNotes(dto.getNotes());
    }
    public AttendanceRecordResponseDto toResponse(AttendanceRecord entity) {
        return AttendanceRecordResponseDto.builder().id(entity.getId()).code(entity.getCode()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).workDate(entity.getWorkDate()).clockIn(entity.getClockIn())
            .clockOut(entity.getClockOut()).breakMinutes(entity.getBreakMinutes()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
