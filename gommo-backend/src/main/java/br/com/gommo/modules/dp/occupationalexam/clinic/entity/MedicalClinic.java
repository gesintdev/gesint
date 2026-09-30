package br.com.gommo.modules.dp.occupationalexam.clinic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

import br.com.gommo.core.entity.AuditEntity;

import org.hibernate.envers.Audited;

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

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "exams_offered", columnDefinition = "TEXT")
    private String examsOffered;

    @Column(name = "accreditation_valid_until")
    private LocalDate accreditationValidUntil;
}
