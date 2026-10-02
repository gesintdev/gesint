package br.com.gommo.modules.dp.payment.entity;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "payment_period")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class PaymentPeriod extends BranchScopedEntity {

    @Column(name = "reference_date", nullable = false)
    private LocalDate referenceDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
