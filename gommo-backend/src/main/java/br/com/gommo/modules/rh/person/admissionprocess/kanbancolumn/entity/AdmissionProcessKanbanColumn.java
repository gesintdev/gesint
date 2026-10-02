package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    public static final String REJECTED_COLUMN_KEY = "rejected";

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
}
