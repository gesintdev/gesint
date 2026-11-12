package br.com.gesint.modules.cfg.dataimport.mapper;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import br.com.gesint.modules.cfg.dataimport.dto.DataImportJobResponseDto;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportRowErrorDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJob;

@Component
public class DataImportJobMapper {

    private final ObjectMapper objectMapper;

    public DataImportJobMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public DataImportJobResponseDto toResponse(DataImportJob job) {
        return DataImportJobResponseDto.builder()
                .id(job.getId())
                .code(job.getCode())
                .entityType(job.getEntityType())
                .importMode(job.getImportMode())
                .jobStatus(job.getJobStatus())
                .sourceFileName(job.getSourceFileName())
                .totalRows(job.getTotalRows())
                .processedRows(job.getProcessedRows())
                .successCount(job.getSuccessCount())
                .errorCount(job.getErrorCount())
                .startedAt(job.getStartedAt())
                .finishedAt(job.getFinishedAt())
                .errors(readErrors(job.getErrorsJson()))
                .build();
    }

    private List<DataImportRowErrorDto> readErrors(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<DataImportRowErrorDto>>() {});
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }
}
