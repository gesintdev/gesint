package br.com.gommo.modules.dp.organization.department.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "department")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Department extends AuditEntity {

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "cost_center", length = 40)
    private String costCenter;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "monthly_budget", precision = 15, scale = 2)
    private BigDecimal monthlyBudget;

    @Column(length = 200)
    private String location;

    @Column(length = 30)
    private String phone;

    @Column(length = 30)
    private String fax;

    @Column(name = "phone_extension", length = 20)
    private String phoneExtension;

    @Column(length = 120)
    private String email;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "responsible_collaborator_ids", columnDefinition = "jsonb", nullable = false)
    private List<UUID> responsibleCollaboratorIds = new ArrayList<>();
}
