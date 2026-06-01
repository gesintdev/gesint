package br.com.gommo.modules.person.leave.dto;
import br.com.gommo.core.entity.StatusEnum; import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class LeaveRequestResponseDto {
    private final UUID id; private final Integer code; private final StatusEnum status; private final UUID collaboratorId; private final LeaveTypeEnum leaveType;
    private final LocalDate startDate; private final LocalDate endDate; private final Boolean approved; private final String notes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}
