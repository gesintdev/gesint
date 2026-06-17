package br.com.gommo.modules.rh.person.offboarding.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "offboarding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Offboarding extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "dismissal_date", nullable = false)
    private LocalDate dismissalDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "dismissal_type", nullable = false, columnDefinition = "dismissal_type_enum")
    private DismissalTypeEnum dismissalType;

    @Column(name = "dismissal_notes", columnDefinition = "TEXT")
    private String dismissalNotes;

    @Column(name = "homologation_notes", columnDefinition = "TEXT")
    private String homologationNotes;
}
