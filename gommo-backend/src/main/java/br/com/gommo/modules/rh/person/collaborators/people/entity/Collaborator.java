package br.com.gommo.modules.rh.person.collaborators.people.entity;

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

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "collaborator")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Collaborator extends AuditEntity {

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "social_name", length = 200)
    private String socialName;

    @Column(nullable = false, length = 14)
    private String cpf;

    @Column(length = 20)
    private String rg;

    @Column(name = "rg_issuer", length = 20)
    private String rgIssuer;

    @Column(name = "rg_state_code", length = 2)
    private String rgStateCode;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "gender_enum")
    private GenderEnum gender;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "marital_status", columnDefinition = "marital_status_enum")
    private MaritalStatusEnum maritalStatus;

    @Column(name = "mother_name", length = 200)
    private String motherName;

    @Column(name = "father_name", length = 200)
    private String fatherName;

    @Column(length = 60)
    private String nationality;

    @Column(name = "pis_pasep", length = 20)
    private String pisPasep;

    @Column(name = "photo_object_id")
    private UUID photoObjectId;
}
