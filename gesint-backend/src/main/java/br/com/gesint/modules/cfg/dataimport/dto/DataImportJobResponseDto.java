package br.com.gesint.modules.cfg.dataimport.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJobStatus;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataImportJobResponseDto {

    private UUID id;
    private Integer code;
    private DataImportEntityType entityType;
    private DataImportMode importMode;
    private DataImportJobStatus jobStatus;
    private String sourceFileName;
    private Integer totalRows;
    private Integer processedRows;
    private Integer successCount;
    private Integer errorCount;
    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;

    @Builder.Default
    private List<DataImportRowErrorDto> errors = new ArrayList<>();
}
