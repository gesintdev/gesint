package br.com.gommo.modules.dp.organization.jobpositionsalarytable.mapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableItemRequestDto;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableItemResponseDto;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableRequestDto;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableResponseDto;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTable;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTableItem;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.exception.JobPositionSalaryTableException;

@Component
public class JobPositionSalaryTableMapper {

    public JobPositionSalaryTable toEntity(JobPositionSalaryTableRequestDto dto) {
        JobPositionSalaryTable table = JobPositionSalaryTable.builder()
                .status(StatusEnum.ACTIVE)
                .jobPositionId(dto.getJobPositionId())
                .name(blankToNull(dto.getName()))
                .versionNumber(1)
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .items(new ArrayList<>())
                .build();
        replaceItems(table, dto.getItems());
        return table;
    }

    public void updateEntity(JobPositionSalaryTable entity, JobPositionSalaryTableRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setName(blankToNull(dto.getName()));
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidUntil(dto.getValidUntil());
        replaceItems(entity, dto.getItems());
    }

    public JobPositionSalaryTableResponseDto toResponse(JobPositionSalaryTable entity) {
        return JobPositionSalaryTableResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobPositionId(entity.getJobPositionId())
                .companyId(entity.getCompanyId())
                .name(entity.getName())
                .versionNumber(entity.getVersionNumber())
                .validFrom(entity.getValidFrom())
                .validUntil(entity.getValidUntil())
                .items(entity.getItems() == null
                        ? List.of()
                        : entity.getItems().stream().map(this::toItemResponse).toList())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void replaceItems(JobPositionSalaryTable table, List<JobPositionSalaryTableItemRequestDto> items) {
        validateItems(items);
        List<JobPositionSalaryTableItem> next = new ArrayList<>();
        for (JobPositionSalaryTableItemRequestDto itemDto : items) {
            next.add(JobPositionSalaryTableItem.builder()
                    .salaryTable(table)
                    .level(itemDto.getLevel())
                    .minSalary(itemDto.getMinSalary())
                    .referenceSalary(itemDto.getReferenceSalary())
                    .maxSalary(itemDto.getMaxSalary())
                    .build());
        }
        table.getItems().clear();
        table.getItems().addAll(next);
    }

    private JobPositionSalaryTableItemResponseDto toItemResponse(JobPositionSalaryTableItem item) {
        return JobPositionSalaryTableItemResponseDto.builder()
                .id(item.getId())
                .level(item.getLevel())
                .minSalary(item.getMinSalary())
                .referenceSalary(item.getReferenceSalary())
                .maxSalary(item.getMaxSalary())
                .build();
    }

    private void validateItems(List<JobPositionSalaryTableItemRequestDto> items) {
        if (items == null || items.isEmpty()) {
            throw JobPositionSalaryTableException.invalidItems();
        }
        EnumSet<JobPositionSalaryLevelEnum> seen = EnumSet.noneOf(JobPositionSalaryLevelEnum.class);
        for (JobPositionSalaryTableItemRequestDto item : items) {
            if (item.getLevel() == null || !seen.add(item.getLevel())) {
                throw JobPositionSalaryTableException.invalidItems();
            }
            validateRange(item.getMinSalary(), item.getReferenceSalary(), item.getMaxSalary());
        }
    }

    private void validateRange(BigDecimal min, BigDecimal reference, BigDecimal max) {
        if (min == null || reference == null || max == null) {
            throw JobPositionSalaryTableException.invalidRange();
        }
        if (min.compareTo(reference) > 0 || reference.compareTo(max) > 0) {
            throw JobPositionSalaryTableException.invalidRange();
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
