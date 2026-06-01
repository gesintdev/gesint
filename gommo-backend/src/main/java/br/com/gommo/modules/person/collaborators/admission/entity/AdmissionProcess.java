package br.com.gommo.modules.person.collaborators.admission.entity;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionEmergencyContactDto;
import br.com.gommo.modules.person.collaborators.people.entity.GenderEnum;
import br.com.gommo.modules.person.collaborators.people.entity.MaritalStatusEnum;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "admission_process")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionProcess extends AuditEntity {

    @Column(name = "collaborator_id")
    private UUID collaboratorId;

    @Column(name = "photo_object_id")
    private UUID photoObjectId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "admission_status", nullable = false, columnDefinition = "admission_status_enum")
    private AdmissionStatusEnum admissionStatus;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "social_name", length = 200)
    private String socialName;

    @Column(nullable = false, length = 14)
    private String cpf;

    @Column(length = 20)
    private String rg;

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

    @Column(length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

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

    @Column(length = 100)
    private String city;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "expected_start_date")
    private LocalDate expectedStartDate;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "job_position_id")
    private UUID jobPositionId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "contract_type", nullable = false, columnDefinition = "contract_type_enum")
    private ContractTypeEnum contractType;

    @Column(name = "base_salary", precision = 14, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "workload_schedule", length = 32)
    private String workloadSchedule;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "emergency_contacts", columnDefinition = "jsonb", nullable = false)
    private List<AdmissionEmergencyContactDto> emergencyContacts = new ArrayList<>();

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;
}
