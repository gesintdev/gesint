package br.com.gommo.modules.organization.jobposition.entity;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "job_position")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class JobPosition extends AuditEntity {

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "cbo_code", length = 10)
    private String cboCode;

    @Column(columnDefinition = "TEXT")
    private String description;
}
