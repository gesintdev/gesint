package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "admission_process_kanban_column")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionProcessKanbanColumn extends AuditEntity {

    @Column(name = "column_key", nullable = false, length = 80)
    private String columnKey;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
