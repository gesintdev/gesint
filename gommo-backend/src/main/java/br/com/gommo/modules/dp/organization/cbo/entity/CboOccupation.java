package br.com.gommo.modules.dp.organization.cbo.entity;

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
@Table(name = "cbo_occupation")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CboOccupation extends AuditEntity {

    @Column(name = "cbo_code", nullable = false, unique = true, length = 6)
    private String cboCode;

    @Column(nullable = false, length = 255)
    private String name;
}
