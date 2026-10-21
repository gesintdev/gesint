import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/main/java/br/com/gesint/modules');
const created = [];

function w(rel, c) {
  const p = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c.trim() + '\n');
  created.push('src/main/java/br/com/gesint/modules/' + rel.replace(/\\/g, '/'));
}

function svc(pkg, entity, perm) {
  w(`${pkg}/service/${entity}Service.java`, `package br.com.gesint.modules.${pkg}.service;
import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gesint.modules.${pkg}.dto.${entity}ResponseDto;
import br.com.gesint.modules.${pkg}.entity.${entity};
import br.com.gesint.modules.${pkg}.exception.${entity}Exception;
import br.com.gesint.modules.${pkg}.mapper.${entity}Mapper;
import br.com.gesint.modules.${pkg}.repository.${entity}Repository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class ${entity}Service extends BaseService<${entity}, ${entity}RequestDto, ${entity}ResponseDto> implements I${entity}Service {
    private final ${entity}Repository repository;
    private final ${entity}Mapper mapper;
    public ${entity}Service(${entity}Repository repository, ${entity}Mapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository; this.mapper = mapper;
    }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('${perm}:read')") public List<${entity}ResponseDto> findAll() { return super.findAll(); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('${perm}:read')") public ${entity}ResponseDto findById(UUID id) { return super.findById(id); }
    @Override @Transactional(readOnly = true) @PreAuthorize("hasAuthority('${perm}:read')") public PageableResponseDto<${entity}ResponseDto> findPage(int page, int size) { return super.findPage(page, size); }
    @Override @Transactional @PreAuthorize("hasAuthority('${perm}:write')") public ${entity}ResponseDto create(${entity}RequestDto request) { return super.create(request); }
    @Override @Transactional @PreAuthorize("hasAuthority('${perm}:write')") public ${entity}ResponseDto update(UUID id, ${entity}RequestDto request) { return super.update(id, request); }
    @Override @Transactional @PreAuthorize("hasAuthority('${perm}:delete')") public void delete(UUID id) { super.delete(id); }
    @Override protected ${entity} findEntity(UUID id) { return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(${entity}Exception::notFound); }
    @Override protected void updateEntity(${entity} entity, ${entity}RequestDto request) { mapper.updateEntity(entity, request); }
}`);
}

function mod(pkg, entity, api, perm, prefix, msg, files) {
  for (const [name, content] of Object.entries(files)) w(`${pkg}/${name}`, content);
  w(`${pkg}/repository/${entity}Repository.java`, `package br.com.gesint.modules.${pkg}.repository;
import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.modules.${pkg}.entity.${entity};
import org.springframework.stereotype.Repository;
@Repository public interface ${entity}Repository extends IBaseRepository<${entity}> {}`);
  w(`${pkg}/exception/${entity}Exceptions.java`, `package br.com.gesint.modules.${pkg}.exception;
public final class ${entity}Exceptions {
    private ${entity}Exceptions() {}
    public static final String NOT_FOUND_CODE = "${prefix}_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "${msg}";
}`);
  w(`${pkg}/exception/${entity}Exception.java`, `package br.com.gesint.modules.${pkg}.exception;
import br.com.gesint.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class ${entity}Exception {
    private ${entity}Exception() {}
    public static BusinessException notFound() {
        return new BusinessException(${entity}Exceptions.NOT_FOUND_CODE, ${entity}Exceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}`);
  w(`${pkg}/service/I${entity}Service.java`, `package br.com.gesint.modules.${pkg}.service;
import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gesint.modules.${pkg}.dto.${entity}ResponseDto;
public interface I${entity}Service extends IBaseService<${entity}RequestDto, ${entity}ResponseDto> {}`);
  svc(pkg, entity, perm);
  w(`${pkg}/controller/${entity}Controller.java`, `package br.com.gesint.modules.${pkg}.controller;
import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gesint.modules.${pkg}.dto.${entity}ResponseDto;
import br.com.gesint.modules.${pkg}.service.I${entity}Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController @RequestMapping("${api}")
public class ${entity}Controller extends BaseController<${entity}RequestDto, ${entity}ResponseDto> {
    public ${entity}Controller(I${entity}Service service) { super(service); }
}`);
}

const E = (pkg, name, vals) => w(`${pkg}/entity/${name}.java`, `package br.com.gesint.modules.${pkg}.entity;
public enum ${name} { ${vals.join(', ')} }`);

// CONTRACT
E('contract', 'ContractTypeEnum', ['CLT', 'PJ', 'INTERMITTENT', 'APPRENTICE', 'INTERN']);
mod('contract', 'EmploymentContract', '/api/v1/contracts', 'contract', 'CONTRACT', 'Contrato não encontrado', {
  'entity/EmploymentContract.java': `package br.com.gesint.modules.contract.entity;
import br.com.gesint.core.entity.AuditEntity;
import jakarta.persistence.Column; import jakarta.persistence.Entity; import jakarta.persistence.EnumType; import jakarta.persistence.Enumerated; import jakarta.persistence.Table;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "employment_contract") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class EmploymentContract extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "company_id") private UUID companyId;
    @Column(name = "job_position_id") private UUID jobPositionId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "contract_type", nullable = false, columnDefinition = "contract_type_enum") private ContractTypeEnum contractType;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "base_salary", precision = 14, scale = 2) private BigDecimal baseSalary;
    @Column(name = "workload_hours", precision = 5, scale = 2) private BigDecimal workloadHours;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/EmploymentContractRequestDto.java': `package br.com.gesint.modules.contract.dto;
import br.com.gesint.modules.contract.entity.ContractTypeEnum;
import jakarta.validation.constraints.NotNull; import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmploymentContractRequestDto {
    @NotNull private UUID collaboratorId; private UUID companyId; private UUID jobPositionId;
    private ContractTypeEnum contractType; @NotNull private LocalDate startDate; private LocalDate endDate;
    private BigDecimal baseSalary; private BigDecimal workloadHours; private String notes;
}`,
  'dto/EmploymentContractResponseDto.java': `package br.com.gesint.modules.contract.dto;
import br.com.gesint.core.entity.StatusEnum; import br.com.gesint.modules.contract.entity.ContractTypeEnum;
import java.math.BigDecimal; import java.time.LocalDate; import java.time.OffsetDateTime; import java.util.UUID;
import lombok.*;
@Getter @Builder
public class EmploymentContractResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final UUID companyId;
    private final UUID jobPositionId; private final ContractTypeEnum contractType; private final LocalDate startDate;
    private final LocalDate endDate; private final BigDecimal baseSalary; private final BigDecimal workloadHours;
    private final String notes; private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/EmploymentContractMapper.java': `package br.com.gesint.modules.contract.mapper;
import br.com.gesint.modules.contract.dto.EmploymentContractRequestDto; import br.com.gesint.modules.contract.dto.EmploymentContractResponseDto;
import br.com.gesint.modules.contract.entity.ContractTypeEnum; import br.com.gesint.modules.contract.entity.EmploymentContract;
import org.springframework.stereotype.Component;
@Component public class EmploymentContractMapper {
    public EmploymentContract toEntity(EmploymentContractRequestDto dto) {
        return EmploymentContract.builder().collaboratorId(dto.getCollaboratorId()).companyId(dto.getCompanyId())
            .jobPositionId(dto.getJobPositionId()).contractType(dto.getContractType() != null ? dto.getContractType() : ContractTypeEnum.CLT)
            .startDate(dto.getStartDate()).endDate(dto.getEndDate()).baseSalary(dto.getBaseSalary())
            .workloadHours(dto.getWorkloadHours()).notes(dto.getNotes()).build();
    }
    public void updateEntity(EmploymentContract entity, EmploymentContractRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setCompanyId(dto.getCompanyId());
        entity.setJobPositionId(dto.getJobPositionId());
        if (dto.getContractType() != null) entity.setContractType(dto.getContractType());
        entity.setStartDate(dto.getStartDate()); entity.setEndDate(dto.getEndDate());
        entity.setBaseSalary(dto.getBaseSalary()); entity.setWorkloadHours(dto.getWorkloadHours()); entity.setNotes(dto.getNotes());
    }
    public EmploymentContractResponseDto toResponse(EmploymentContract entity) {
        return EmploymentContractResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).companyId(entity.getCompanyId()).jobPositionId(entity.getJobPositionId())
            .contractType(entity.getContractType()).startDate(entity.getStartDate()).endDate(entity.getEndDate())
            .baseSalary(entity.getBaseSalary()).workloadHours(entity.getWorkloadHours()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// ATTENDANCE
mod('attendance', 'AttendanceRecord', '/api/v1/attendance-records', 'attendance', 'ATTENDANCE', 'Registro de ponto não encontrado', {
  'entity/AttendanceRecord.java': `package br.com.gesint.modules.attendance.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.time.LocalTime; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "attendance_record") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class AttendanceRecord extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "work_date", nullable = false) private LocalDate workDate;
    @Column(name = "clock_in") private LocalTime clockIn;
    @Column(name = "clock_out") private LocalTime clockOut;
    @Column(name = "break_minutes") private Integer breakMinutes;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/AttendanceRecordRequestDto.java': `package br.com.gesint.modules.attendance.dto;
import jakarta.validation.constraints.NotNull; import java.time.LocalDate; import java.time.LocalTime; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceRecordRequestDto {
    @NotNull private UUID collaboratorId; @NotNull private LocalDate workDate;
    private LocalTime clockIn; private LocalTime clockOut; private Integer breakMinutes; private String notes;
}`,
  'dto/AttendanceRecordResponseDto.java': `package br.com.gesint.modules.attendance.dto;
import br.com.gesint.core.entity.StatusEnum; import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class AttendanceRecordResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final LocalDate workDate;
    private final LocalTime clockIn; private final LocalTime clockOut; private final Integer breakMinutes; private final String notes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/AttendanceRecordMapper.java': `package br.com.gesint.modules.attendance.mapper;
import br.com.gesint.modules.attendance.dto.*; import br.com.gesint.modules.attendance.entity.AttendanceRecord; import org.springframework.stereotype.Component;
@Component public class AttendanceRecordMapper {
    public AttendanceRecord toEntity(AttendanceRecordRequestDto dto) {
        return AttendanceRecord.builder().collaboratorId(dto.getCollaboratorId()).workDate(dto.getWorkDate())
            .clockIn(dto.getClockIn()).clockOut(dto.getClockOut()).breakMinutes(dto.getBreakMinutes()).notes(dto.getNotes()).build();
    }
    public void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setWorkDate(dto.getWorkDate());
        entity.setClockIn(dto.getClockIn()); entity.setClockOut(dto.getClockOut());
        entity.setBreakMinutes(dto.getBreakMinutes()); entity.setNotes(dto.getNotes());
    }
    public AttendanceRecordResponseDto toResponse(AttendanceRecord entity) {
        return AttendanceRecordResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).workDate(entity.getWorkDate()).clockIn(entity.getClockIn())
            .clockOut(entity.getClockOut()).breakMinutes(entity.getBreakMinutes()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// LEAVE
E('leave', 'LeaveTypeEnum', ['VACATION', 'MEDICAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER']);
mod('leave', 'LeaveRequest', '/api/v1/leave-requests', 'leave', 'LEAVE', 'Solicitação de afastamento não encontrada', {
  'entity/LeaveRequest.java': `package br.com.gesint.modules.leave.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "leave_request") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class LeaveRequest extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "leave_type", nullable = false, columnDefinition = "leave_type_enum") private LeaveTypeEnum leaveType;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date", nullable = false) private LocalDate endDate;
    @Column(nullable = false) private Boolean approved;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/LeaveRequestRequestDto.java': `package br.com.gesint.modules.leave.dto;
import br.com.gesint.modules.leave.entity.LeaveTypeEnum; import jakarta.validation.constraints.NotNull; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveRequestRequestDto {
    @NotNull private UUID collaboratorId; private LeaveTypeEnum leaveType;
    @NotNull private LocalDate startDate; @NotNull private LocalDate endDate; private Boolean approved; private String notes;
}`,
  'dto/LeaveRequestResponseDto.java': `package br.com.gesint.modules.leave.dto;
import br.com.gesint.core.entity.StatusEnum; import br.com.gesint.modules.leave.entity.LeaveTypeEnum;
import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class LeaveRequestResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final LeaveTypeEnum leaveType;
    private final LocalDate startDate; private final LocalDate endDate; private final Boolean approved; private final String notes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/LeaveRequestMapper.java': `package br.com.gesint.modules.leave.mapper;
import br.com.gesint.modules.leave.dto.*; import br.com.gesint.modules.leave.entity.LeaveRequest; import br.com.gesint.modules.leave.entity.LeaveTypeEnum;
import org.springframework.stereotype.Component;
@Component public class LeaveRequestMapper {
    public LeaveRequest toEntity(LeaveRequestRequestDto dto) {
        return LeaveRequest.builder().collaboratorId(dto.getCollaboratorId())
            .leaveType(dto.getLeaveType() != null ? dto.getLeaveType() : LeaveTypeEnum.VACATION)
            .startDate(dto.getStartDate()).endDate(dto.getEndDate())
            .approved(dto.getApproved() != null ? dto.getApproved() : Boolean.FALSE).notes(dto.getNotes()).build();
    }
    public void updateEntity(LeaveRequest entity, LeaveRequestRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getLeaveType() != null) entity.setLeaveType(dto.getLeaveType());
        entity.setStartDate(dto.getStartDate()); entity.setEndDate(dto.getEndDate());
        if (dto.getApproved() != null) entity.setApproved(dto.getApproved());
        entity.setNotes(dto.getNotes());
    }
    public LeaveRequestResponseDto toResponse(LeaveRequest entity) {
        return LeaveRequestResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).leaveType(entity.getLeaveType())
            .startDate(entity.getStartDate()).endDate(entity.getEndDate()).approved(entity.getApproved()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// PAYROLL
E('payroll', 'PayrollStatusEnum', ['DRAFT', 'PROCESSING', 'CLOSED', 'CANCELLED']);
mod('payroll', 'PayrollRun', '/api/v1/payroll-runs', 'payroll', 'PAYROLL', 'Folha de pagamento não encontrada', {
  'entity/PayrollRun.java': `package br.com.gesint.modules.payroll.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.OffsetDateTime; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "payroll_run") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class PayrollRun extends AuditEntity {
    @Column(name = "company_id") private UUID companyId;
    @Column(name = "reference_year", nullable = false) private Integer referenceYear;
    @Column(name = "reference_month", nullable = false) private Integer referenceMonth;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "payroll_status", nullable = false, columnDefinition = "payroll_status_enum") private PayrollStatusEnum payrollStatus;
    @Column(name = "processed_at") private OffsetDateTime processedAt;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/PayrollRunRequestDto.java': `package br.com.gesint.modules.payroll.dto;
import br.com.gesint.modules.payroll.entity.PayrollStatusEnum; import jakarta.validation.constraints.NotNull; import java.time.OffsetDateTime; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PayrollRunRequestDto {
    private UUID companyId; @NotNull private Integer referenceYear; @NotNull private Integer referenceMonth;
    private PayrollStatusEnum payrollStatus; private OffsetDateTime processedAt; private String notes;
}`,
  'dto/PayrollRunResponseDto.java': `package br.com.gesint.modules.payroll.dto;
import br.com.gesint.core.entity.StatusEnum; import br.com.gesint.modules.payroll.entity.PayrollStatusEnum;
import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class PayrollRunResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID companyId;
    private final Integer referenceYear; private final Integer referenceMonth; private final PayrollStatusEnum payrollStatus;
    private final OffsetDateTime processedAt; private final String notes; private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/PayrollRunMapper.java': `package br.com.gesint.modules.payroll.mapper;
import br.com.gesint.modules.payroll.dto.*; import br.com.gesint.modules.payroll.entity.PayrollRun; import br.com.gesint.modules.payroll.entity.PayrollStatusEnum;
import org.springframework.stereotype.Component;
@Component public class PayrollRunMapper {
    public PayrollRun toEntity(PayrollRunRequestDto dto) {
        return PayrollRun.builder().companyId(dto.getCompanyId()).referenceYear(dto.getReferenceYear()).referenceMonth(dto.getReferenceMonth())
            .payrollStatus(dto.getPayrollStatus() != null ? dto.getPayrollStatus() : PayrollStatusEnum.DRAFT)
            .processedAt(dto.getProcessedAt()).notes(dto.getNotes()).build();
    }
    public void updateEntity(PayrollRun entity, PayrollRunRequestDto dto) {
        entity.setCompanyId(dto.getCompanyId()); entity.setReferenceYear(dto.getReferenceYear()); entity.setReferenceMonth(dto.getReferenceMonth());
        if (dto.getPayrollStatus() != null) entity.setPayrollStatus(dto.getPayrollStatus());
        entity.setProcessedAt(dto.getProcessedAt()); entity.setNotes(dto.getNotes());
    }
    public PayrollRunResponseDto toResponse(PayrollRun entity) {
        return PayrollRunResponseDto.builder().id(entity.getId()).status(entity.getStatus()).companyId(entity.getCompanyId())
            .referenceYear(entity.getReferenceYear()).referenceMonth(entity.getReferenceMonth()).payrollStatus(entity.getPayrollStatus())
            .processedAt(entity.getProcessedAt()).notes(entity.getNotes()).createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// PAYSLIP
mod('payslip', 'Payslip', '/api/v1/payslips', 'payslip', 'PAYSLIP', 'Holerite não encontrado', {
  'entity/Payslip.java': `package br.com.gesint.modules.payslip.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.math.BigDecimal; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "payslip") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class Payslip extends AuditEntity {
    @Column(name = "payroll_run_id", nullable = false) private UUID payrollRunId;
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "gross_amount", nullable = false, precision = 14, scale = 2) private BigDecimal grossAmount;
    @Column(name = "deductions_amount", nullable = false, precision = 14, scale = 2) private BigDecimal deductionsAmount;
    @Column(name = "net_amount", nullable = false, precision = 14, scale = 2) private BigDecimal netAmount;
}`,
  'dto/PayslipRequestDto.java': `package br.com.gesint.modules.payslip.dto;
import jakarta.validation.constraints.NotNull; import java.math.BigDecimal; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PayslipRequestDto {
    @NotNull private UUID payrollRunId; @NotNull private UUID collaboratorId;
    private BigDecimal grossAmount; private BigDecimal deductionsAmount; private BigDecimal netAmount;
}`,
  'dto/PayslipResponseDto.java': `package br.com.gesint.modules.payslip.dto;
import br.com.gesint.core.entity.StatusEnum; import java.math.BigDecimal; import java.time.OffsetDateTime; import java.util.UUID; import lombok.*;
@Getter @Builder
public class PayslipResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID payrollRunId; private final UUID collaboratorId;
    private final BigDecimal grossAmount; private final BigDecimal deductionsAmount; private final BigDecimal netAmount;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/PayslipMapper.java': `package br.com.gesint.modules.payslip.mapper;
import br.com.gesint.modules.payslip.dto.*; import br.com.gesint.modules.payslip.entity.Payslip; import org.springframework.stereotype.Component;
import java.math.BigDecimal;
@Component public class PayslipMapper {
    public Payslip toEntity(PayslipRequestDto dto) {
        return Payslip.builder().payrollRunId(dto.getPayrollRunId()).collaboratorId(dto.getCollaboratorId())
            .grossAmount(dto.getGrossAmount() != null ? dto.getGrossAmount() : BigDecimal.ZERO)
            .deductionsAmount(dto.getDeductionsAmount() != null ? dto.getDeductionsAmount() : BigDecimal.ZERO)
            .netAmount(dto.getNetAmount() != null ? dto.getNetAmount() : BigDecimal.ZERO).build();
    }
    public void updateEntity(Payslip entity, PayslipRequestDto dto) {
        entity.setPayrollRunId(dto.getPayrollRunId()); entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getGrossAmount() != null) entity.setGrossAmount(dto.getGrossAmount());
        if (dto.getDeductionsAmount() != null) entity.setDeductionsAmount(dto.getDeductionsAmount());
        if (dto.getNetAmount() != null) entity.setNetAmount(dto.getNetAmount());
    }
    public PayslipResponseDto toResponse(Payslip entity) {
        return PayslipResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .payrollRunId(entity.getPayrollRunId()).collaboratorId(entity.getCollaboratorId())
            .grossAmount(entity.getGrossAmount()).deductionsAmount(entity.getDeductionsAmount()).netAmount(entity.getNetAmount())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// BENEFIT
mod('benefit', 'BenefitPlan', '/api/v1/benefit-plans', 'benefit', 'BENEFIT', 'Plano de benefício não encontrado', {
  'entity/BenefitPlan.java': `package br.com.gesint.modules.benefit.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.math.BigDecimal;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "benefit_plan") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BenefitPlan extends AuditEntity {
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "benefit_type", nullable = false, length = 60) private String benefitType;
    @Column(name = "monthly_value", precision = 14, scale = 2) private BigDecimal monthlyValue;
    @Column(columnDefinition = "TEXT") private String description;
}`,
  'dto/BenefitPlanRequestDto.java': `package br.com.gesint.modules.benefit.dto;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import java.math.BigDecimal; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BenefitPlanRequestDto {
    @NotBlank @Size(max = 120) private String name; @NotBlank @Size(max = 60) private String benefitType;
    private BigDecimal monthlyValue; private String description;
}`,
  'dto/BenefitPlanResponseDto.java': `package br.com.gesint.modules.benefit.dto;
import br.com.gesint.core.entity.StatusEnum; import java.math.BigDecimal; import java.time.OffsetDateTime; import java.util.UUID; import lombok.*;
@Getter @Builder
public class BenefitPlanResponseDto {
    private final UUID id; private final StatusEnum status; private final String name; private final String benefitType;
    private final BigDecimal monthlyValue; private final String description; private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/BenefitPlanMapper.java': `package br.com.gesint.modules.benefit.mapper;
import br.com.gesint.modules.benefit.dto.*; import br.com.gesint.modules.benefit.entity.BenefitPlan; import org.springframework.stereotype.Component;
@Component public class BenefitPlanMapper {
    public BenefitPlan toEntity(BenefitPlanRequestDto dto) {
        return BenefitPlan.builder().name(dto.getName()).benefitType(dto.getBenefitType())
            .monthlyValue(dto.getMonthlyValue()).description(dto.getDescription()).build();
    }
    public void updateEntity(BenefitPlan entity, BenefitPlanRequestDto dto) {
        entity.setName(dto.getName()); entity.setBenefitType(dto.getBenefitType());
        entity.setMonthlyValue(dto.getMonthlyValue()); entity.setDescription(dto.getDescription());
    }
    public BenefitPlanResponseDto toResponse(BenefitPlan entity) {
        return BenefitPlanResponseDto.builder().id(entity.getId()).status(entity.getStatus()).name(entity.getName())
            .benefitType(entity.getBenefitType()).monthlyValue(entity.getMonthlyValue()).description(entity.getDescription())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// ADMISSION
E('admission', 'AdmissionStatusEnum', ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
mod('admission', 'AdmissionProcess', '/api/v1/admissions', 'admission', 'ADMISSION', 'Processo de admissão não encontrado', {
  'entity/AdmissionProcess.java': `package br.com.gesint.modules.admission.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "admission_process") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class AdmissionProcess extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "admission_status", nullable = false, columnDefinition = "admission_status_enum") private AdmissionStatusEnum admissionStatus;
    @Column(name = "started_at") private LocalDate startedAt;
    @Column(name = "completed_at") private LocalDate completedAt;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/AdmissionProcessRequestDto.java': `package br.com.gesint.modules.admission.dto;
import br.com.gesint.modules.admission.entity.AdmissionStatusEnum; import jakarta.validation.constraints.NotNull; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AdmissionProcessRequestDto {
    @NotNull private UUID collaboratorId; private AdmissionStatusEnum admissionStatus;
    private LocalDate startedAt; private LocalDate completedAt; private String notes;
}`,
  'dto/AdmissionProcessResponseDto.java': `package br.com.gesint.modules.admission.dto;
import br.com.gesint.core.entity.StatusEnum; import br.com.gesint.modules.admission.entity.AdmissionStatusEnum;
import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class AdmissionProcessResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final AdmissionStatusEnum admissionStatus;
    private final LocalDate startedAt; private final LocalDate completedAt; private final String notes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/AdmissionProcessMapper.java': `package br.com.gesint.modules.admission.mapper;
import br.com.gesint.modules.admission.dto.*; import br.com.gesint.modules.admission.entity.AdmissionProcess; import br.com.gesint.modules.admission.entity.AdmissionStatusEnum;
import org.springframework.stereotype.Component;
@Component public class AdmissionProcessMapper {
    public AdmissionProcess toEntity(AdmissionProcessRequestDto dto) {
        return AdmissionProcess.builder().collaboratorId(dto.getCollaboratorId())
            .admissionStatus(dto.getAdmissionStatus() != null ? dto.getAdmissionStatus() : AdmissionStatusEnum.DRAFT)
            .startedAt(dto.getStartedAt()).completedAt(dto.getCompletedAt()).notes(dto.getNotes()).build();
    }
    public void updateEntity(AdmissionProcess entity, AdmissionProcessRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getAdmissionStatus() != null) entity.setAdmissionStatus(dto.getAdmissionStatus());
        entity.setStartedAt(dto.getStartedAt()); entity.setCompletedAt(dto.getCompletedAt()); entity.setNotes(dto.getNotes());
    }
    public AdmissionProcessResponseDto toResponse(AdmissionProcess entity) {
        return AdmissionProcessResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).admissionStatus(entity.getAdmissionStatus())
            .startedAt(entity.getStartedAt()).completedAt(entity.getCompletedAt()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// OFFBOARDING
E('offboarding', 'DismissalTypeEnum', ['WITHOUT_CAUSE', 'WITH_CAUSE', 'RESIGNATION', 'AGREEMENT', 'END_OF_CONTRACT', 'OTHER']);
mod('offboarding', 'Offboarding', '/api/v1/offboardings', 'offboarding', 'OFFBOARDING', 'Desligamento não encontrado', {
  'entity/Offboarding.java': `package br.com.gesint.modules.offboarding.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name = "offboarding") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class Offboarding extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "dismissal_date", nullable = false) private LocalDate dismissalDate;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "dismissal_type", nullable = false, columnDefinition = "dismissal_type_enum") private DismissalTypeEnum dismissalType;
    @Column(name = "dismissal_notes", columnDefinition = "TEXT") private String dismissalNotes;
    @Column(name = "homologation_notes", columnDefinition = "TEXT") private String homologationNotes;
}`,
  'dto/OffboardingRequestDto.java': `package br.com.gesint.modules.offboarding.dto;
import br.com.gesint.modules.offboarding.entity.DismissalTypeEnum; import jakarta.validation.constraints.NotNull; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OffboardingRequestDto {
    @NotNull private UUID collaboratorId; @NotNull private LocalDate dismissalDate; private DismissalTypeEnum dismissalType;
    private String dismissalNotes; private String homologationNotes;
}`,
  'dto/OffboardingResponseDto.java': `package br.com.gesint.modules.offboarding.dto;
import br.com.gesint.core.entity.StatusEnum; import br.com.gesint.modules.offboarding.entity.DismissalTypeEnum;
import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class OffboardingResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final LocalDate dismissalDate;
    private final DismissalTypeEnum dismissalType; private final String dismissalNotes; private final String homologationNotes;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/OffboardingMapper.java': `package br.com.gesint.modules.offboarding.mapper;
import br.com.gesint.modules.offboarding.dto.*; import br.com.gesint.modules.offboarding.entity.Offboarding; import br.com.gesint.modules.offboarding.entity.DismissalTypeEnum;
import org.springframework.stereotype.Component;
@Component public class OffboardingMapper {
    public Offboarding toEntity(OffboardingRequestDto dto) {
        return Offboarding.builder().collaboratorId(dto.getCollaboratorId()).dismissalDate(dto.getDismissalDate())
            .dismissalType(dto.getDismissalType() != null ? dto.getDismissalType() : DismissalTypeEnum.WITHOUT_CAUSE)
            .dismissalNotes(dto.getDismissalNotes()).homologationNotes(dto.getHomologationNotes()).build();
    }
    public void updateEntity(Offboarding entity, OffboardingRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setDismissalDate(dto.getDismissalDate());
        if (dto.getDismissalType() != null) entity.setDismissalType(dto.getDismissalType());
        entity.setDismissalNotes(dto.getDismissalNotes()); entity.setHomologationNotes(dto.getHomologationNotes());
    }
    public OffboardingResponseDto toResponse(Offboarding entity) {
        return OffboardingResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).dismissalDate(entity.getDismissalDate()).dismissalType(entity.getDismissalType())
            .dismissalNotes(entity.getDismissalNotes()).homologationNotes(entity.getHomologationNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

// EXIT INTERVIEW
mod('exitinterview', 'ExitInterview', '/api/v1/exit-interviews', 'exitinterview', 'EXITINTERVIEW', 'Entrevista de desligamento não encontrada', {
  'entity/ExitInterview.java': `package br.com.gesint.modules.exitinterview.entity;
import br.com.gesint.core.entity.AuditEntity; import jakarta.persistence.*; import java.time.LocalDate; import java.util.UUID;
import lombok.*; import lombok.experimental.SuperBuilder;
@Entity @Table(name = "exit_interview") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class ExitInterview extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "interview_date", nullable = false) private LocalDate interviewDate;
    @Column(name = "departure_reason", length = 255) private String departureReason;
    @Column(columnDefinition = "TEXT") private String feedback;
    @Column(name = "would_recommend") private Boolean wouldRecommend;
}`,
  'dto/ExitInterviewRequestDto.java': `package br.com.gesint.modules.exitinterview.dto;
import jakarta.validation.constraints.NotNull; import jakarta.validation.constraints.Size; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExitInterviewRequestDto {
    @NotNull private UUID collaboratorId; @NotNull private LocalDate interviewDate;
    @Size(max = 255) private String departureReason; private String feedback; private Boolean wouldRecommend;
}`,
  'dto/ExitInterviewResponseDto.java': `package br.com.gesint.modules.exitinterview.dto;
import br.com.gesint.core.entity.StatusEnum; import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class ExitInterviewResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final LocalDate interviewDate;
    private final String departureReason; private final String feedback; private final Boolean wouldRecommend;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}`,
  'mapper/ExitInterviewMapper.java': `package br.com.gesint.modules.exitinterview.mapper;
import br.com.gesint.modules.exitinterview.dto.*; import br.com.gesint.modules.exitinterview.entity.ExitInterview; import org.springframework.stereotype.Component;
@Component public class ExitInterviewMapper {
    public ExitInterview toEntity(ExitInterviewRequestDto dto) {
        return ExitInterview.builder().collaboratorId(dto.getCollaboratorId()).interviewDate(dto.getInterviewDate())
            .departureReason(dto.getDepartureReason()).feedback(dto.getFeedback()).wouldRecommend(dto.getWouldRecommend()).build();
    }
    public void updateEntity(ExitInterview entity, ExitInterviewRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setInterviewDate(dto.getInterviewDate());
        entity.setDepartureReason(dto.getDepartureReason()); entity.setFeedback(dto.getFeedback());
        entity.setWouldRecommend(dto.getWouldRecommend());
    }
    public ExitInterviewResponseDto toResponse(ExitInterview entity) {
        return ExitInterviewResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).interviewDate(entity.getInterviewDate())
            .departureReason(entity.getDepartureReason()).feedback(entity.getFeedback()).wouldRecommend(entity.getWouldRecommend())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

console.log(created.length);
created.forEach(f => console.log(f));
