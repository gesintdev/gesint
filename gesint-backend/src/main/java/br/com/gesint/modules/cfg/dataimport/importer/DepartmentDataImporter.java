package br.com.gesint.modules.cfg.dataimport.importer;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelValueParser;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentRequestDto;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentResponseDto;
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.dp.organization.department.service.IDepartmentService;

@Component
public class DepartmentDataImporter implements DataImporter {

    private final IDepartmentService departmentService;
    private final DepartmentRepository departmentRepository;
    private final DataImportLookupHelper lookupHelper;

    public DepartmentDataImporter(
            IDepartmentService departmentService,
            DepartmentRepository departmentRepository,
            DataImportLookupHelper lookupHelper) {
        this.departmentService = departmentService;
        this.departmentRepository = departmentRepository;
        this.lookupHelper = lookupHelper;
    }

    @Override
    public DataImportEntityType entityType() {
        return DataImportEntityType.DEPARTMENT;
    }

    @Override
    public String importRow(DataImportMode mode, Map<String, String> row) {
        DepartmentRequestDto request = toRequest(row, mode);
        if (mode == DataImportMode.INSERT) {
            DepartmentResponseDto created = departmentService.create(request);
            return "codigo=" + created.getCode();
        }
        Integer code = ExcelValueParser.requiredInteger(row, "codigo");
        UUID id = departmentRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Departamento nao encontrado para update: " + code))
                .getId();
        DepartmentResponseDto existing = departmentService.findById(id);
        mergeForUpdate(request, existing);
        departmentService.update(id, request);
        return "codigo=" + code;
    }

    private DepartmentRequestDto toRequest(Map<String, String> row, DataImportMode mode) {
        Integer parentCode = ExcelValueParser.integer(row, "codigo_pai");
        Integer companyCode = ExcelValueParser.integer(row, "codigo_filial");
        Boolean shared = ExcelValueParser.bool(row, "compartilhado_filiais");
        return DepartmentRequestDto.builder()
                .name(
                        mode == DataImportMode.INSERT
                                ? ExcelValueParser.requiredText(row, "nome")
                                : ExcelValueParser.text(row, "nome"))
                .costCenter(ExcelValueParser.text(row, "centro_custo"))
                .description(ExcelValueParser.text(row, "descricao"))
                .monthlyBudget(ExcelValueParser.decimal(row, "orcamento_mensal"))
                .location(ExcelValueParser.text(row, "localizacao"))
                .phone(ExcelValueParser.text(row, "telefone"))
                .fax(ExcelValueParser.text(row, "fax"))
                .phoneExtension(ExcelValueParser.text(row, "ramal"))
                .email(ExcelValueParser.text(row, "email"))
                .parentId(lookupHelper.departmentIdByCode(parentCode))
                .companyId(lookupHelper.companyIdByCode(companyCode))
                .sharedAcrossBranches(shared)
                .build();
    }

    private void mergeForUpdate(DepartmentRequestDto request, DepartmentResponseDto existing) {
        if (request.getName() == null) {
            request.setName(existing.getName());
        }
        if (request.getCostCenter() == null) {
            request.setCostCenter(existing.getCostCenter());
        }
        if (request.getDescription() == null) {
            request.setDescription(existing.getDescription());
        }
        if (request.getMonthlyBudget() == null) {
            request.setMonthlyBudget(existing.getMonthlyBudget());
        }
        if (request.getLocation() == null) {
            request.setLocation(existing.getLocation());
        }
        if (request.getPhone() == null) {
            request.setPhone(existing.getPhone());
        }
        if (request.getFax() == null) {
            request.setFax(existing.getFax());
        }
        if (request.getPhoneExtension() == null) {
            request.setPhoneExtension(existing.getPhoneExtension());
        }
        if (request.getEmail() == null) {
            request.setEmail(existing.getEmail());
        }
        if (request.getParentId() == null) {
            request.setParentId(existing.getParentId());
        }
        if (request.getCompanyId() == null && request.getSharedAcrossBranches() == null) {
            request.setCompanyId(existing.getCompanyId());
        }
        if (request.getSharedAcrossBranches() == null) {
            request.setSharedAcrossBranches(existing.isSharedAcrossBranches());
        }
        if (request.getResponsibleCollaboratorIds() == null || request.getResponsibleCollaboratorIds().isEmpty()) {
            request.setResponsibleCollaboratorIds(existing.getResponsibleCollaboratorIds());
        }
    }
}
