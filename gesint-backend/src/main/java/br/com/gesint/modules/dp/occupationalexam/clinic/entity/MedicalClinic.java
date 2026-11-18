package br.com.gesint.modules.dp.occupationalexam.clinic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import br.com.gesint.core.entity.AuditEntity;
import br.com.gesint.modules.rh.person.collaborators.address.entity.City;
import br.com.gesint.modules.rh.person.collaborators.address.entity.State;

@Entity
@Audited
@Table(name = "medical_clinic")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalClinic extends AuditEntity {

    @Column(name = "corporate_name", nullable = false, length = 200)
    private String corporateName;

    @Column(nullable = false, length = 20)
    private String cnpj;

    @Column(length = 255)
    private String address;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(length = 200)
    private String street;

    @Column(length = 20)
    private String number;

    @Column(length = 100)
    private String complement;

    @Column(length = 100)
    private String district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private State state;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "exams_offered", columnDefinition = "TEXT")
    private String examsOffered;

    @Column(name = "accreditation_valid_until")
    private LocalDate accreditationValidUntil;
}
