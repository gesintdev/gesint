package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "admission_process_kanban_column")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionProcessKanbanColumn extends AuditEntity {

    /** Coluna de sistema: candidaturas encerradas (reprovacao, desistencia, vaga cancelada). */
    public static final String CLOSED_COLUMN_KEY = "closed";

    /** @deprecated use {@link #CLOSED_COLUMN_KEY}; mantido para dados legados. */
    @Deprecated
    public static final String REJECTED_COLUMN_KEY = "closed";

    @Column(name = "column_key", nullable = false, length = 80)
    private String columnKey;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Builder.Default
    @Column(name = "system_column", nullable = false)
    private boolean systemColumn = false;

    @Builder.Default
    @Column(name = "sla_enabled", nullable = false)
    private boolean slaEnabled = true;

    @Builder.Default
    @Column(name = "sla_business_days", nullable = false)
    private Integer slaBusinessDays = 5;

    /** Quando true, o card nesta coluna exibe a aba Avaliacao (scorecard de entrevista). */
    @Builder.Default
    @Column(name = "interview_column", nullable = false)
    private boolean interviewColumn = false;

    /** Acao disparada ao entrar na coluna (ex.: abrir proposta de contratacao). */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "column_action", nullable = false, length = 40)
    private KanbanColumnActionEnum columnAction = KanbanColumnActionEnum.NONE;
}
