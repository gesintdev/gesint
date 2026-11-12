package br.com.gesint.modules.cfg.dataimport.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportActiveLockDto;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportJobResponseDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJob;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJobStatus;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelSheetReader;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelTemplateBuilder;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.cfg.dataimport.mapper.DataImportJobMapper;
import br.com.gesint.modules.cfg.dataimport.repository.DataImportJobRepository;

@Service
public class DataImportService implements IDataImportService {

    private static final List<DataImportJobStatus> ACTIVE_STATUSES =
            List.of(DataImportJobStatus.PENDING, DataImportJobStatus.RUNNING);

    private final DataImportJobRepository repository;
    private final DataImportJobMapper mapper;
    private final ExcelTemplateBuilder templateBuilder;
    private final ExcelSheetReader sheetReader;
    private final DataImportProcessTrigger processTrigger;

    public DataImportService(
            DataImportJobRepository repository,
            DataImportJobMapper mapper,
            ExcelTemplateBuilder templateBuilder,
            ExcelSheetReader sheetReader,
            DataImportProcessTrigger processTrigger) {
        this.repository = repository;
        this.mapper = mapper;
        this.templateBuilder = templateBuilder;
        this.sheetReader = sheetReader;
        this.processTrigger = processTrigger;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize(
            "hasAnyAuthority('department:write','jobposition:write','admission:write','department:read','jobposition:read','admission:read')")
    public ResponseEntity<Resource> downloadTemplate(DataImportEntityType entityType, DataImportMode mode) {
        assertCanWrite(entityType);
        byte[] bytes = templateBuilder.build(entityType, mode);
        String filename = "modelo_"
                + entityType.name().toLowerCase(Locale.ROOT)
                + "_"
                + mode.name().toLowerCase(Locale.ROOT)
                + ".xlsx";
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(resource);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('department:write','jobposition:write','admission:write')")
    public DataImportJobResponseDto upload(DataImportEntityType entityType, DataImportMode mode, MultipartFile file) {
        assertCanWrite(entityType);
        if (file == null || file.isEmpty()) {
            throw DataImportException.invalidFile();
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw DataImportException.invalidFile();
        }
        if (repository.existsByEntityTypeAndJobStatusInAndStatusNot(entityType, ACTIVE_STATUSES, StatusEnum.DELETED)) {
            throw DataImportException.alreadyRunning();
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception ex) {
            throw DataImportException.invalidFile();
        }

        // Validate headers/rows before creating the job.
        int totalRows = sheetReader.readRows(bytes, entityType, mode).size();

        DataImportJob job = DataImportJob.builder()
                .status(StatusEnum.ACTIVE)
                .entityType(entityType)
                .importMode(mode)
                .jobStatus(DataImportJobStatus.PENDING)
                .sourceFileName(originalName)
                .totalRows(totalRows)
                .processedRows(0)
                .successCount(0)
                .errorCount(0)
                .build();
        DataImportJob saved = repository.save(job);
        processTrigger.scheduleAfterCommit(saved.getId(), bytes);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize(
            "hasAnyAuthority('department:write','jobposition:write','admission:write','department:read','jobposition:read','admission:read')")
    public DataImportJobResponseDto findById(UUID jobId) {
        DataImportJob job = repository
                .findByIdAndStatusNot(jobId, StatusEnum.DELETED)
                .orElseThrow(DataImportException::notFound);
        assertCanRead(job.getEntityType());
        return mapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize(
            "hasAnyAuthority('department:write','jobposition:write','admission:write','department:read','jobposition:read','admission:read')")
    public List<DataImportJobResponseDto> findActive() {
        return repository.findAllByJobStatusInAndStatusNotOrderByCreatedAtDesc(ACTIVE_STATUSES, StatusEnum.DELETED)
                .stream()
                .filter(job -> canRead(job.getEntityType()))
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize(
            "hasAnyAuthority('department:write','jobposition:write','admission:write','department:read','jobposition:read','admission:read')")
    public List<DataImportActiveLockDto> findActiveLocks() {
        return repository.findAllByJobStatusInAndStatusNotOrderByCreatedAtDesc(ACTIVE_STATUSES, StatusEnum.DELETED)
                .stream()
                .filter(job -> canRead(job.getEntityType()))
                .map(job -> DataImportActiveLockDto.builder()
                        .entityType(job.getEntityType())
                        .importMode(job.getImportMode())
                        .jobId(job.getId())
                        .processedRows(job.getProcessedRows())
                        .totalRows(job.getTotalRows())
                        .build())
                .toList();
    }

    private void assertCanWrite(DataImportEntityType entityType) {
        if (!hasAuthority(writeAuthority(entityType))) {
            throw DataImportException.forbidden();
        }
    }

    private void assertCanRead(DataImportEntityType entityType) {
        if (!canRead(entityType)) {
            throw DataImportException.forbidden();
        }
    }

    private boolean canRead(DataImportEntityType entityType) {
        return hasAuthority(readAuthority(entityType)) || hasAuthority(writeAuthority(entityType));
    }

    private static String writeAuthority(DataImportEntityType entityType) {
        return switch (entityType) {
            case DEPARTMENT -> "department:write";
            case JOB_POSITION -> "jobposition:write";
            case ADMISSION -> "admission:write";
        };
    }

    private static String readAuthority(DataImportEntityType entityType) {
        return switch (entityType) {
            case DEPARTMENT -> "department:read";
            case JOB_POSITION -> "jobposition:read";
            case ADMISSION -> "admission:read";
        };
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream().anyMatch(a -> authority.equals(a.getAuthority()));
    }
}
