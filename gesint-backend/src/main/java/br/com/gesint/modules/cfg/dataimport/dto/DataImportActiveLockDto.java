package br.com.gesint.modules.cfg.dataimport.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataImportActiveLockDto {

    private DataImportEntityType entityType;
    private DataImportMode importMode;
    private UUID jobId;
    private Integer processedRows;
    private Integer totalRows;
}
