package br.com.gommo.modules.dp.occupationalexam.physician.entity;

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

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "occupational_physician")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalPhysician extends AuditEntity {

    @Column(name = "full_name", nullable = false, length = 180)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String crm;

    @Column(name = "crm_state", nullable = false, length = 2)
    private String crmState;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "occupational_physician_role_enum")
    private OccupationalPhysicianRoleEnum role;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;
}
