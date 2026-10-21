import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '../src/main/java/br/com/gesint/modules');
const created = [];

function write(rel, content) {
  const p = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
  created.push(path.join('src/main/java/br/com/gesint/modules', rel).replace(/\\/g, '/'));
}

function stdService(pkg, entity, perm, extraCreate = '', extraUpdate = '') {
  write(`${pkg}/service/${entity}Service.java`, `package br.com.gesint.modules.${pkg}.service;

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
public class ${entity}Service extends BaseService<${entity}, ${entity}RequestDto, ${entity}ResponseDto>
        implements I${entity}Service {

    private final ${entity}Repository repository;
    private final ${entity}Mapper mapper;

    public ${entity}Service(${entity}Repository repository, ${entity}Mapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('${perm}:read')")
    public List<${entity}ResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('${perm}:read')")
    public ${entity}ResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('${perm}:read')")
    public PageableResponseDto<${entity}ResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('${perm}:write')")
    public ${entity}ResponseDto create(${entity}RequestDto request) {
${extraCreate}
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('${perm}:write')")
    public ${entity}ResponseDto update(UUID id, ${entity}RequestDto request) {
${extraUpdate}
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('${perm}:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected ${entity} findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(${entity}Exception::notFound);
    }

    @Override
    protected void updateEntity(${entity} entity, ${entity}RequestDto request) {
        mapper.updateEntity(entity, request);
    }
}`);
}

function stdBoiler(pkg, entity, apiPath, perm, prefix, notFoundMsg, entitySrc, reqSrc, respSrc, mapperSrc, extraRepo = '') {
  write(`${pkg}/entity/${entity}.java`, entitySrc);
  write(`${pkg}/dto/${entity}RequestDto.java`, reqSrc);
  write(`${pkg}/dto/${entity}ResponseDto.java`, respSrc);
  write(`${pkg}/mapper/${entity}Mapper.java`, mapperSrc);
  write(`${pkg}/repository/${entity}Repository.java`, `package br.com.gesint.modules.${pkg}.repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.modules.${pkg}.entity.${entity};
import org.springframework.stereotype.Repository;
${extraRepo}

@Repository
public interface ${entity}Repository extends IBaseRepository<${entity}> {
}
`);
  write(`${pkg}/exception/${entity}Exceptions.java`, `package br.com.gesint.modules.${pkg}.exception;

public final class ${entity}Exceptions {

    private ${entity}Exceptions() {}

    public static final String NOT_FOUND_CODE = "${prefix}_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "${notFoundMsg}";
}
`);
  write(`${pkg}/exception/${entity}Exception.java`, `package br.com.gesint.modules.${pkg}.exception;

import br.com.gesint.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class ${entity}Exception {

    private ${entity}Exception() {}

    public static BusinessException notFound() {
        return new BusinessException(
                ${entity}Exceptions.NOT_FOUND_CODE,
                ${entity}Exceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
`);
  write(`${pkg}/service/I${entity}Service.java`, `package br.com.gesint.modules.${pkg}.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gesint.modules.${pkg}.dto.${entity}ResponseDto;

public interface I${entity}Service extends IBaseService<${entity}RequestDto, ${entity}ResponseDto> {
}
`);
  stdService(pkg, entity, perm);
  write(`${pkg}/controller/${entity}Controller.java`, `package br.com.gesint.modules.${pkg}.controller;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.${pkg}.dto.${entity}RequestDto;
import br.com.gesint.modules.${pkg}.dto.${entity}ResponseDto;
import br.com.gesint.modules.${pkg}.service.I${entity}Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${apiPath}")
public class ${entity}Controller extends BaseController<${entity}RequestDto, ${entity}ResponseDto> {

    public ${entity}Controller(I${entity}Service service) {
        super(service);
    }
}
`);
}

function pgEnum(pkg, enumName, values) {
  write(`${pkg}/entity/${enumName}.java`, `package br.com.gesint.modules.${pkg}.entity;

public enum ${enumName} {
    ${values.join(',\n    ')}
}
`);
}

function fieldEnum(type, name, col, enumDef, required = true) {
  const n = required ? ', nullable = false' : '';
  return `
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "${col}"${n}, columnDefinition = "${enumDef}")
    private ${type} ${name};`;
}

// DEPARTMENT
stdBoiler('department', 'Department', '/api/v1/departments', 'department', 'DEPARTMENT', 'Departamento não encontrado',
`package br.com.gesint.modules.department.entity;

import br.com.gesint.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "department")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Department extends AuditEntity {

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "cost_center", length = 40)
    private String costCenter;
}`,
`package br.com.gesint.modules.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequestDto {

    private UUID companyId;
    private UUID parentId;

    @NotBlank
    @Size(max = 120)
    private String name;

    @Size(max = 40)
    private String costCenter;
}`,
`package br.com.gesint.modules.department.dto;

import br.com.gesint.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentResponseDto {

    private final UUID id;
    private final StatusEnum status;
    private final UUID companyId;
    private final UUID parentId;
    private final String name;
    private final String costCenter;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}`,
`package br.com.gesint.modules.department.mapper;

import br.com.gesint.modules.department.dto.DepartmentRequestDto;
import br.com.gesint.modules.department.dto.DepartmentResponseDto;
import br.com.gesint.modules.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentRequestDto dto) {
        return Department.builder()
                .companyId(dto.getCompanyId())
                .parentId(dto.getParentId())
                .name(dto.getName())
                .costCenter(dto.getCostCenter())
                .build();
    }

    public void updateEntity(Department entity, DepartmentRequestDto dto) {
        entity.setCompanyId(dto.getCompanyId());
        entity.setParentId(dto.getParentId());
        entity.setName(dto.getName());
        entity.setCostCenter(dto.getCostCenter());
    }

    public DepartmentResponseDto toResponse(Department entity) {
        return DepartmentResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .parentId(entity.getParentId())
                .name(entity.getName())
                .costCenter(entity.getCostCenter())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}`);

// JOB POSITION
stdBoiler('jobposition', 'JobPosition', '/api/v1/job-positions', 'jobposition', 'JOBPOSITION', 'Cargo não encontrado',
`package br.com.gesint.modules.jobposition.entity;

import br.com.gesint.core.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "job_position")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class JobPosition extends AuditEntity {

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "cbo_code", length = 10)
    private String cboCode;

    @Column(columnDefinition = "TEXT")
    private String description;
}`,
`package br.com.gesint.modules.jobposition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionRequestDto {

    private UUID departmentId;

    @NotBlank
    @Size(max = 120)
    private String title;

    @Size(max = 10)
    private String cboCode;

    private String description;
}`,
`package br.com.gesint.modules.jobposition.dto;

import br.com.gesint.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPositionResponseDto {

    private final UUID id;
    private final StatusEnum status;
    private final UUID departmentId;
    private final String title;
    private final String cboCode;
    private final String description;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}`,
`package br.com.gesint.modules.jobposition.mapper;

import br.com.gesint.modules.jobposition.dto.JobPositionRequestDto;
import br.com.gesint.modules.jobposition.dto.JobPositionResponseDto;
import br.com.gesint.modules.jobposition.entity.JobPosition;
import org.springframework.stereotype.Component;

@Component
public class JobPositionMapper {

    public JobPosition toEntity(JobPositionRequestDto dto) {
        return JobPosition.builder()
                .departmentId(dto.getDepartmentId())
                .title(dto.getTitle())
                .cboCode(dto.getCboCode())
                .description(dto.getDescription())
                .build();
    }

    public void updateEntity(JobPosition entity, JobPositionRequestDto dto) {
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setTitle(dto.getTitle());
        entity.setCboCode(dto.getCboCode());
        entity.setDescription(dto.getDescription());
    }

    public JobPositionResponseDto toResponse(JobPosition entity) {
        return JobPositionResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .departmentId(entity.getDepartmentId())
                .title(entity.getTitle())
                .cboCode(entity.getCboCode())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}`);

console.log('Created', created.length, 'files');
console.log(created.join('\n'));
