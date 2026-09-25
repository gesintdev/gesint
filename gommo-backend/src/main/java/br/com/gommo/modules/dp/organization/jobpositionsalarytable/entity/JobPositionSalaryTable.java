package br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Filter;

import br.com.gommo.core.branch.BranchCatalogEntity;

@Entity
@Table(name = "job_position_salary_table")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchCatalogEntity.FILTER_NAME, condition = BranchCatalogEntity.FILTER_CONDITION)
public class JobPositionSalaryTable extends BranchCatalogEntity {

    @Column(name = "job_position_id", nullable = false)
    private UUID jobPositionId;

    @Column(length = 120)
    private String name;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Builder.Default
    @OneToMany(mappedBy = "salaryTable", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("level ASC")
    private List<JobPositionSalaryTableItem> items = new ArrayList<>();
}
