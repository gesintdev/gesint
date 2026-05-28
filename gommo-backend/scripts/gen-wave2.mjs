import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/main/java/br/com/gommo/modules');

function w(rel, c) {
  const p = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c.trim() + '\n');
}

function svc(pkg, entity, perm) {
  w(`${pkg}/service/${entity}Service.java`, `package br.com.gommo.modules.${pkg}.service;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gommo.modules.${pkg}.dto.${entity}ResponseDto;
import br.com.gommo.modules.${pkg}.entity.${entity};
import br.com.gommo.modules.${pkg}.exception.${entity}Exception;
import br.com.gommo.modules.${pkg}.mapper.${entity}Mapper;
import br.com.gommo.modules.${pkg}.repository.${entity}Repository;
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
        this.repository = repository;
        this.mapper = mapper;
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
  w(`${pkg}/repository/${entity}Repository.java`, `package br.com.gommo.modules.${pkg}.repository;
import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.${pkg}.entity.${entity};
import org.springframework.stereotype.Repository;
@Repository public interface ${entity}Repository extends IBaseRepository<${entity}> {}`);
  w(`${pkg}/exception/${entity}Exceptions.java`, `package br.com.gommo.modules.${pkg}.exception;
public final class ${entity}Exceptions {
    private ${entity}Exceptions() {}
    public static final String NOT_FOUND_CODE = "${prefix}_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "${msg}";
}`);
  w(`${pkg}/exception/${entity}Exception.java`, `package br.com.gommo.modules.${pkg}.exception;
import br.com.gommo.core.exception.BusinessException;
import org.springframework.http.HttpStatus;
public final class ${entity}Exception {
    private ${entity}Exception() {}
    public static BusinessException notFound() {
        return new BusinessException(${entity}Exceptions.NOT_FOUND_CODE, ${entity}Exceptions.NOT_FOUND_MSG, HttpStatus.NOT_FOUND);
    }
}`);
  w(`${pkg}/service/I${entity}Service.java`, `package br.com.gommo.modules.${pkg}.service;
import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gommo.modules.${pkg}.dto.${entity}ResponseDto;
public interface I${entity}Service extends IBaseService<${entity}RequestDto, ${entity}ResponseDto> {}`);
  svc(pkg, entity, perm);
  w(`${pkg}/controller/${entity}Controller.java`, `package br.com.gommo.modules.${pkg}.controller;
import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gommo.modules.${pkg}.dto.${entity}ResponseDto;
import br.com.gommo.modules.${pkg}.service.I${entity}Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController @RequestMapping("${api}")
public class ${entity}Controller extends BaseController<${entity}RequestDto, ${entity}ResponseDto> {
    public ${entity}Controller(I${entity}Service service) { super(service); }
}`);
}

function E(pkg, name, vals) {
  w(`${pkg}/entity/${name}.java`, `package br.com.gommo.modules.${pkg}.entity;
public enum ${name} { ${vals.join(', ')} }`);
}

E('tax', 'TaxObligationTypeEnum', ['IRRF', 'INSS', 'FGTS', 'OTHER']);
mod('tax', 'TaxObligation', '/api/v1/tax-obligations', 'tax', 'TAX', 'Obrigação fiscal não encontrada', {
  'entity/TaxObligation.java': `package br.com.gommo.modules.tax.entity;
import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity @Table(name = "tax_obligation") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class TaxObligation extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "obligation_type", nullable = false, columnDefinition = "tax_obligation_type_enum") private TaxObligationTypeEnum obligationType;
    @Column(name = "reference_code", length = 60) private String referenceCode;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "base_amount", precision = 14, scale = 2) private BigDecimal baseAmount;
    @Column(name = "rate_percent", precision = 5, scale = 2) private BigDecimal ratePercent;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/TaxObligationRequestDto.java': `package br.com.gommo.modules.tax.dto;
import br.com.gommo.modules.tax.entity.TaxObligationTypeEnum;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaxObligationRequestDto {
    @NotNull private UUID collaboratorId;
    private TaxObligationTypeEnum obligationType;
    private String referenceCode;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal baseAmount;
    private BigDecimal ratePercent;
    private String notes;
}`,
  'dto/TaxObligationResponseDto.java': `package br.com.gommo.modules.tax.dto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.tax.entity.TaxObligationTypeEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class TaxObligationResponseDto {
    private final UUID id;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final TaxObligationTypeEnum obligationType;
    private final String referenceCode;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal baseAmount;
    private final BigDecimal ratePercent;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}`,
  'mapper/TaxObligationMapper.java': `package br.com.gommo.modules.tax.mapper;
import br.com.gommo.modules.tax.dto.*;
import br.com.gommo.modules.tax.entity.TaxObligation;
import br.com.gommo.modules.tax.entity.TaxObligationTypeEnum;
import org.springframework.stereotype.Component;
@Component public class TaxObligationMapper {
    public TaxObligation toEntity(TaxObligationRequestDto dto) {
        return TaxObligation.builder().collaboratorId(dto.getCollaboratorId())
            .obligationType(dto.getObligationType() != null ? dto.getObligationType() : TaxObligationTypeEnum.IRRF)
            .referenceCode(dto.getReferenceCode()).startDate(dto.getStartDate()).endDate(dto.getEndDate())
            .baseAmount(dto.getBaseAmount()).ratePercent(dto.getRatePercent()).notes(dto.getNotes()).build();
    }
    public void updateEntity(TaxObligation entity, TaxObligationRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getObligationType() != null) entity.setObligationType(dto.getObligationType());
        entity.setReferenceCode(dto.getReferenceCode());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setBaseAmount(dto.getBaseAmount());
        entity.setRatePercent(dto.getRatePercent());
        entity.setNotes(dto.getNotes());
    }
    public TaxObligationResponseDto toResponse(TaxObligation entity) {
        return TaxObligationResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).obligationType(entity.getObligationType())
            .referenceCode(entity.getReferenceCode()).startDate(entity.getStartDate()).endDate(entity.getEndDate())
            .baseAmount(entity.getBaseAmount()).ratePercent(entity.getRatePercent()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

E('performance', 'PerformanceRatingEnum', ['NEEDS_IMPROVEMENT', 'MEETS', 'EXCEEDS', 'OUTSTANDING']);
mod('performance', 'PerformanceReview', '/api/v1/performance-reviews', 'performance', 'PERFORMANCE', 'Avaliação de desempenho não encontrada', {
  'entity/PerformanceReview.java': `package br.com.gommo.modules.performance.entity;
import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity @Table(name = "performance_review") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReview extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "period_start", nullable = false) private LocalDate periodStart;
    @Column(name = "period_end", nullable = false) private LocalDate periodEnd;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "performance_rating_enum") private PerformanceRatingEnum rating;
    @Column(name = "goals_summary", columnDefinition = "TEXT") private String goalsSummary;
    @Column(columnDefinition = "TEXT") private String feedback;
    @Column(name = "reviewer_name", length = 200) private String reviewerName;
}`,
  'dto/PerformanceReviewRequestDto.java': `package br.com.gommo.modules.performance.dto;
import br.com.gommo.modules.performance.entity.PerformanceRatingEnum;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReviewRequestDto {
    @NotNull private UUID collaboratorId;
    @NotNull private LocalDate periodStart;
    @NotNull private LocalDate periodEnd;
    private PerformanceRatingEnum rating;
    private String goalsSummary;
    private String feedback;
    private String reviewerName;
}`,
  'dto/PerformanceReviewResponseDto.java': `package br.com.gommo.modules.performance.dto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.performance.entity.PerformanceRatingEnum;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class PerformanceReviewResponseDto {
    private final UUID id;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final PerformanceRatingEnum rating;
    private final String goalsSummary;
    private final String feedback;
    private final String reviewerName;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}`,
  'mapper/PerformanceReviewMapper.java': `package br.com.gommo.modules.performance.mapper;
import br.com.gommo.modules.performance.dto.*;
import br.com.gommo.modules.performance.entity.PerformanceReview;
import org.springframework.stereotype.Component;
@Component public class PerformanceReviewMapper {
    public PerformanceReview toEntity(PerformanceReviewRequestDto dto) {
        return PerformanceReview.builder().collaboratorId(dto.getCollaboratorId())
            .periodStart(dto.getPeriodStart()).periodEnd(dto.getPeriodEnd()).rating(dto.getRating())
            .goalsSummary(dto.getGoalsSummary()).feedback(dto.getFeedback()).reviewerName(dto.getReviewerName()).build();
    }
    public void updateEntity(PerformanceReview entity, PerformanceReviewRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setPeriodStart(dto.getPeriodStart());
        entity.setPeriodEnd(dto.getPeriodEnd());
        entity.setRating(dto.getRating());
        entity.setGoalsSummary(dto.getGoalsSummary());
        entity.setFeedback(dto.getFeedback());
        entity.setReviewerName(dto.getReviewerName());
    }
    public PerformanceReviewResponseDto toResponse(PerformanceReview entity) {
        return PerformanceReviewResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).periodStart(entity.getPeriodStart())
            .periodEnd(entity.getPeriodEnd()).rating(entity.getRating()).goalsSummary(entity.getGoalsSummary())
            .feedback(entity.getFeedback()).reviewerName(entity.getReviewerName())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

mod('benefitenrollment', 'BenefitEnrollment', '/api/v1/benefit-enrollments', 'benefitenrollment', 'BENEFIT_ENROLLMENT', 'Vínculo de benefício não encontrado', {
  'entity/BenefitEnrollment.java': `package br.com.gommo.modules.benefitenrollment.entity;
import br.com.gommo.core.entity.AuditEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;
@Entity @Table(name = "benefit_enrollment") @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class BenefitEnrollment extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false) private UUID collaboratorId;
    @Column(name = "benefit_plan_id", nullable = false) private UUID benefitPlanId;
    @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "monthly_value", precision = 14, scale = 2) private BigDecimal monthlyValue;
    @Column(columnDefinition = "TEXT") private String notes;
}`,
  'dto/BenefitEnrollmentRequestDto.java': `package br.com.gommo.modules.benefitenrollment.dto;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BenefitEnrollmentRequestDto {
    @NotNull private UUID collaboratorId;
    @NotNull private UUID benefitPlanId;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyValue;
    private String notes;
}`,
  'dto/BenefitEnrollmentResponseDto.java': `package br.com.gommo.modules.benefitenrollment.dto;
import br.com.gommo.core.entity.StatusEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class BenefitEnrollmentResponseDto {
    private final UUID id;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final UUID benefitPlanId;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal monthlyValue;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}`,
  'mapper/BenefitEnrollmentMapper.java': `package br.com.gommo.modules.benefitenrollment.mapper;
import br.com.gommo.modules.benefitenrollment.dto.*;
import br.com.gommo.modules.benefitenrollment.entity.BenefitEnrollment;
import org.springframework.stereotype.Component;
@Component public class BenefitEnrollmentMapper {
    public BenefitEnrollment toEntity(BenefitEnrollmentRequestDto dto) {
        return BenefitEnrollment.builder().collaboratorId(dto.getCollaboratorId())
            .benefitPlanId(dto.getBenefitPlanId()).startDate(dto.getStartDate()).endDate(dto.getEndDate())
            .monthlyValue(dto.getMonthlyValue()).notes(dto.getNotes()).build();
    }
    public void updateEntity(BenefitEnrollment entity, BenefitEnrollmentRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setBenefitPlanId(dto.getBenefitPlanId());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setMonthlyValue(dto.getMonthlyValue());
        entity.setNotes(dto.getNotes());
    }
    public BenefitEnrollmentResponseDto toResponse(BenefitEnrollment entity) {
        return BenefitEnrollmentResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).benefitPlanId(entity.getBenefitPlanId())
            .startDate(entity.getStartDate()).endDate(entity.getEndDate()).monthlyValue(entity.getMonthlyValue())
            .notes(entity.getNotes()).createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}`,
});

console.log('gen-wave2: tax, performance, benefitenrollment');
