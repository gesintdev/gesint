package br.com.gommo.modules.payroll.event.entity;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "payroll_event")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEvent extends AuditEntity {

    @Column(name = "event_code", nullable = false, length = 30)
    private String eventCode;

    @Column(nullable = false, length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "event_type", nullable = false, columnDefinition = "payroll_event_type_enum")
    private PayrollEventTypeEnum eventType;

    @Column(name = "incides_inss", nullable = false)
    private Boolean incidesInss;

    @Column(name = "incides_fgts", nullable = false)
    private Boolean incidesFgts;

    @Column(name = "incides_irrf", nullable = false)
    private Boolean incidesIrrf;

    @Column(columnDefinition = "TEXT")
    private String formula;
}
