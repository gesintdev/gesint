package br.com.gesint.modules.cfg.dataimport.service;

import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.cfg.dataimport.dto.DataImportActiveLockDto;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportJobResponseDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;

public interface IDataImportService {

    ResponseEntity<Resource> downloadTemplate(DataImportEntityType entityType, DataImportMode mode);

    DataImportJobResponseDto upload(DataImportEntityType entityType, DataImportMode mode, MultipartFile file);

    DataImportJobResponseDto findById(UUID jobId);

    List<DataImportJobResponseDto> findActive();

    List<DataImportActiveLockDto> findActiveLocks();
}
