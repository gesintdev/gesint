package br.com.gesint.modules.dp.offboarding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import org.hibernate.envers.Audited;

import br.com.gesint.core.entity.AuditEntity;

@Entity
@Audited
@Table(name = "esocial_table19_dismissal_reason")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EsocialDismissalReason extends AuditEntity {

    @Column(name = "reason_code", nullable = false, length = 10, unique = true)
    private String reasonCode;

    @Column(nullable = false, length = 240)
    private String description;

    @Column(name = "dismissal_type", nullable = false, length = 40)
    private String dismissalType;

    @Column(nullable = false)
    private Boolean active;
}
