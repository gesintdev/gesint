package br.com.gommo.modules.person.attendance.dto;
import br.com.gommo.core.entity.StatusEnum; import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class AttendanceRecordResponseDto {
    private final UUID id; private final Integer code; private final StatusEnum status; private final UUID collaboratorId; private final LocalDate workDate;
    private final LocalTime clockIn; private final LocalTime clockOut; private final Integer breakMinutes; private final String notes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}
