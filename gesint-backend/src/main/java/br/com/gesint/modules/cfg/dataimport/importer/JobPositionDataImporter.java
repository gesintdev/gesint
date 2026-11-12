package br.com.gesint.modules.cfg.dataimport.importer;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelValueParser;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gesint.modules.dp.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.dp.organization.jobposition.service.IJobPositionService;

@Component
public class JobPositionDataImporter implements DataImporter {

    private final IJobPositionService jobPositionService;
    private final JobPositionRepository jobPositionRepository;
    private final DataImportLookupHelper lookupHelper;

    public JobPositionDataImporter(
            IJobPositionService jobPositionService,
            JobPositionRepository jobPositionRepository,
            DataImportLookupHelper lookupHelper) {
        this.jobPositionService = jobPositionService;
        this.jobPositionRepository = jobPositionRepository;
        this.lookupHelper = lookupHelper;
    }

    @Override
    public DataImportEntityType entityType() {
        return DataImportEntityType.JOB_POSITION;
    }

    @Override
    public String importRow(DataImportMode mode, Map<String, String> row) {
        JobPositionRequestDto request = toRequest(row, mode);
        if (mode == DataImportMode.INSERT) {
            JobPositionResponseDto created = jobPositionService.create(request);
            return "codigo=" + created.getCode();
        }
        Integer code = ExcelValueParser.requiredInteger(row, "codigo");
        UUID id = jobPositionRepository
                .findByCodeAndStatusNot(code, StatusEnum.DELETED)
                .orElseThrow(() -> DataImportException.rowError("Cargo nao encontrado para update: " + code))
                .getId();
        JobPositionResponseDto existing = jobPositionService.findById(id);
        mergeForUpdate(request, existing);
        jobPositionService.update(id, request);
        return "codigo=" + code;
    }

    private JobPositionRequestDto toRequest(Map<String, String> row, DataImportMode mode) {
        Integer departmentCode = ExcelValueParser.integer(row, "codigo_departamento");
        Integer companyCode = ExcelValueParser.integer(row, "codigo_filial");
        Boolean shared = ExcelValueParser.bool(row, "compartilhado_filiais");
        return JobPositionRequestDto.builder()
                .title(
                        mode == DataImportMode.INSERT
                                ? ExcelValueParser.requiredText(row, "titulo")
                                : ExcelValueParser.text(row, "titulo"))
                .departmentId(lookupHelper.departmentIdByCode(departmentCode))
                .companyId(lookupHelper.companyIdByCode(companyCode))
                .cboCode(ExcelValueParser.text(row, "codigo_cbo"))
                .nature(ExcelValueParser.enumValue(row, "natureza", JobPositionNatureEnum.class))
                .description(ExcelValueParser.text(row, "descricao"))
                .sharedAcrossBranches(shared)
                .build();
    }

    private void mergeForUpdate(JobPositionRequestDto request, JobPositionResponseDto existing) {
        if (request.getTitle() == null) {
            request.setTitle(existing.getTitle());
        }
        if (request.getDepartmentId() == null) {
            request.setDepartmentId(existing.getDepartmentId());
        }
        if (request.getCompanyId() == null && request.getSharedAcrossBranches() == null) {
            request.setCompanyId(existing.getCompanyId());
        }
        if (request.getSharedAcrossBranches() == null) {
            request.setSharedAcrossBranches(existing.isSharedAcrossBranches());
        }
        if (request.getCboCode() == null) {
            request.setCboCode(existing.getCboCode());
        }
        if (request.getNature() == null) {
            request.setNature(existing.getNature());
        }
        if (request.getDescription() == null) {
            request.setDescription(existing.getDescription());
        }
    }
}
