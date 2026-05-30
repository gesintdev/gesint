package br.com.gommo.modules.person.attendance.dto;
import jakarta.validation.constraints.NotNull; import java.time.LocalDate; import java.time.LocalTime; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceRecordRequestDto {
    @NotNull private UUID collaboratorId; @NotNull private LocalDate workDate;
    private LocalTime clockIn; private LocalTime clockOut; private Integer breakMinutes; private String notes;
}
