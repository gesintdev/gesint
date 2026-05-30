package br.com.gommo.modules.person.leave.entity;
import br.com.gommo.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "leave_request") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class LeaveRequest extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "leave_type", nullable = false, columnDefinition = "leave_type_enum") private LeaveTypeEnum leaveType;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date", nullable = false) private LocalDate endDate;
    @Column(nullable = false) private Boolean approved;
    @Column(columnDefinition = "TEXT") private String notes;
}
