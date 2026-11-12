package br.com.gesint.modules.cfg.dataimport.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.cfg.dataimport.dto.DataImportActiveLockDto;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportJobResponseDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.service.IDataImportService;

@RestController
@RequestMapping("/api/v1/data-imports")
public class DataImportController {

    private final IDataImportService service;

    public DataImportController(IDataImportService service) {
        this.service = service;
    }

    @GetMapping("/template")
    public ResponseEntity<Resource> downloadTemplate(
            @RequestParam DataImportEntityType entityType, @RequestParam DataImportMode mode) {
        return service.downloadTemplate(entityType, mode);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DataImportJobResponseDto> upload(
            @RequestParam DataImportEntityType entityType,
            @RequestParam DataImportMode mode,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(entityType, mode, file));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<DataImportJobResponseDto> findById(@PathVariable UUID jobId) {
        return ResponseEntity.ok(service.findById(jobId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<DataImportJobResponseDto>> findActive() {
        return ResponseEntity.ok(service.findActive());
    }

    @GetMapping("/active-locks")
    public ResponseEntity<List<DataImportActiveLockDto>> findActiveLocks() {
        return ResponseEntity.ok(service.findActiveLocks());
    }
}
