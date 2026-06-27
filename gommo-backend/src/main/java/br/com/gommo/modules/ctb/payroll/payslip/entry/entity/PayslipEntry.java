package br.com.gommo.modules.ctb.payroll.payslip.entry.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "payslip_entry")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipEntry extends AuditEntity {

    @Column(name = "payslip_id", nullable = false)
    private UUID payslipId;

    @Column(name = "payroll_event_id", nullable = false)
    private UUID payrollEventId;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitValue;

    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue;
}
