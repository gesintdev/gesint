package br.com.gommo.modules.rh.person.exitinterview.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "exit_interview")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterview extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    @Column(name = "departure_reason", length = 255)
    private String departureReason;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "would_recommend")
    private Boolean wouldRecommend;
}
