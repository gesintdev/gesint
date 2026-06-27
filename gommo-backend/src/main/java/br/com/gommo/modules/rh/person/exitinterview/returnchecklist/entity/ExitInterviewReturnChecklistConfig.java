package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.entity;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "exit_interview_return_checklist_item")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewReturnChecklistConfig extends AuditEntity {

    @Column(name = "item_key", nullable = false, length = 80)
    private String itemKey;

    @Column(nullable = false, length = 160)
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
