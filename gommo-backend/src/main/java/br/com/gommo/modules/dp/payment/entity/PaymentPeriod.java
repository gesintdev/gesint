package br.com.gommo.modules.dp.payment.entity;

import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "payment_period")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPeriod extends AuditEntity {

    @Column(name = "reference_date", nullable = false)
    private LocalDate referenceDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
