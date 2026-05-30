package br.com.gommo.modules.person.exitinterview.entity;
import br.com.gommo.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "exit_interview") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class ExitInterview extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "interview_date", nullable = false) private LocalDate interviewDate;
    @Column(name = "departure_reason", length = 255) private String departureReason;
    @Column(columnDefinition = "TEXT") private String feedback;
    @Column(name = "would_recommend") private Boolean wouldRecommend;
}
