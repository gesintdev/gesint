package br.com.gesint.modules.cfg.dataimport.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.exception.BusinessException;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportRowErrorDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJob;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelSheetReader;
import br.com.gesint.modules.cfg.dataimport.excel.ExcelValueParser;
import br.com.gesint.modules.cfg.dataimport.importer.DataImporter;
import br.com.gesint.modules.cfg.dataimport.repository.DataImportJobRepository;

@Service
public class DataImportAsyncProcessor {

    private static final Logger log = LoggerFactory.getLogger(DataImportAsyncProcessor.class);

    private final DataImportJobRepository repository;
    private final DataImportProgressService progressService;
    private final ExcelSheetReader sheetReader;
    private final Map<br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType, DataImporter> importers;

    public DataImportAsyncProcessor(
            DataImportJobRepository repository,
            DataImportProgressService progressService,
            ExcelSheetReader sheetReader,
            List<DataImporter> importerList) {
        this.repository = repository;
        this.progressService = progressService;
        this.sheetReader = sheetReader;
        this.importers = importerList.stream()
                .collect(Collectors.toMap(DataImporter::entityType, Function.identity()));
    }

    @Async("dataImportExecutor")
    public void process(
            UUID jobId, byte[] fileBytes, TenantContext capturedTenant, Authentication authentication) {
        Authentication previousAuth = SecurityContextHolder.getContext().getAuthentication();
        try {
            if (capturedTenant != null) {
                TenantContextHolder.set(capturedTenant);
            }
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            DataImportJob job = repository
                    .findByIdAndStatusNot(jobId, StatusEnum.DELETED)
                    .orElse(null);
            if (job == null) {
                return;
            }

            List<Map<String, String>> rows = sheetReader.readRows(fileBytes, job.getEntityType(), job.getImportMode());
            progressService.markRunning(jobId, rows.size());

            DataImporter importer = importers.get(job.getEntityType());
            if (importer == null) {
                progressService.markFailed(jobId, "Importer nao encontrado para " + job.getEntityType());
                return;
            }

            int success = 0;
            int errors = 0;
            List<DataImportRowErrorDto> errorRows = new ArrayList<>();
            int processed = 0;

            for (Map<String, String> row : rows) {
                processed++;
                int rowNumber = ExcelValueParser.rowNumber(row);
                try {
                    String matchKey = importer.importRow(job.getImportMode(), row);
                    success++;
                    log.debug("Import row ok job={} row={} key={}", jobId, rowNumber, matchKey);
                } catch (BusinessException ex) {
                    errors++;
                    errorRows.add(DataImportRowErrorDto.builder()
                            .rowNumber(rowNumber)
                            .matchKey(null)
                            .message(ex.getMessage())
                            .rowSnapshot(ExcelValueParser.snapshot(row))
                            .build());
                } catch (Exception ex) {
                    errors++;
                    errorRows.add(DataImportRowErrorDto.builder()
                            .rowNumber(rowNumber)
                            .matchKey(null)
                            .message(ex.getMessage() != null ? ex.getMessage() : "Erro inesperado na linha")
                            .rowSnapshot(ExcelValueParser.snapshot(row))
                            .build());
                    log.warn("Import row failed job={} row={}", jobId, rowNumber, ex);
                }
                progressService.updateProgress(jobId, processed, success, errors);
            }

            progressService.markCompleted(jobId, success, errors, errorRows);
        } catch (Exception ex) {
            log.error("Data import job failed id={}", jobId, ex);
            progressService.markFailed(jobId, ex.getMessage() != null ? ex.getMessage() : "Falha no processamento");
        } finally {
            SecurityContextHolder.getContext().setAuthentication(previousAuth);
            TenantContextHolder.clear();
        }
    }
}
