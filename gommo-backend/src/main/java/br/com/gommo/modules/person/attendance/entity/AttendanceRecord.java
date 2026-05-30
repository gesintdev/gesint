package br.com.gommo.modules.person.attendance.entity;
import br.com.gommo.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.time.LocalTime; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "attendance_record") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class AttendanceRecord extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "work_date", nullable = false) private LocalDate workDate;
    @Column(name = "clock_in") private LocalTime clockIn;
    @Column(name = "clock_out") private LocalTime clockOut;
    @Column(name = "break_minutes") private Integer breakMinutes;
    @Column(columnDefinition = "TEXT") private String notes;
}
