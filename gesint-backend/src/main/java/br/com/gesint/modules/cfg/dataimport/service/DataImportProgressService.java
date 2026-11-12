package br.com.gesint.modules.cfg.dataimport.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.dataimport.dto.DataImportRowErrorDto;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJob;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportJobStatus;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;
import br.com.gesint.modules.cfg.dataimport.repository.DataImportJobRepository;

@Service
public class DataImportProgressService {

    private final DataImportJobRepository repository;
    private final ObjectMapper objectMapper;

    public DataImportProgressService(DataImportJobRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markRunning(UUID jobId, int totalRows) {
        DataImportJob job = findJob(jobId);
        job.setJobStatus(DataImportJobStatus.RUNNING);
        job.setTotalRows(totalRows);
        job.setProcessedRows(0);
        job.setSuccessCount(0);
        job.setErrorCount(0);
        job.setStartedAt(OffsetDateTime.now());
        repository.save(job);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateProgress(UUID jobId, int processedRows, int successCount, int errorCount) {
        DataImportJob job = findJob(jobId);
        job.setProcessedRows(processedRows);
        job.setSuccessCount(successCount);
        job.setErrorCount(errorCount);
        repository.save(job);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markCompleted(UUID jobId, int successCount, int errorCount, List<DataImportRowErrorDto> errors) {
        DataImportJob job = findJob(jobId);
        job.setJobStatus(DataImportJobStatus.COMPLETED);
        job.setProcessedRows(job.getTotalRows());
        job.setSuccessCount(successCount);
        job.setErrorCount(errorCount);
        job.setErrorsJson(writeErrors(errors));
        job.setFinishedAt(OffsetDateTime.now());
        repository.save(job);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(UUID jobId, String message) {
        DataImportJob job = findJob(jobId);
        job.setJobStatus(DataImportJobStatus.FAILED);
        job.setFinishedAt(OffsetDateTime.now());
        job.setErrorsJson(writeErrors(List.of(DataImportRowErrorDto.builder()
                .rowNumber(0)
                .matchKey(null)
                .message(message)
                .rowSnapshot(null)
                .build())));
        job.setErrorCount(Math.max(1, job.getErrorCount() == null ? 1 : job.getErrorCount()));
        repository.save(job);
    }

    private DataImportJob findJob(UUID jobId) {
        return repository
                .findByIdAndStatusNot(jobId, StatusEnum.DELETED)
                .orElseThrow(DataImportException::notFound);
    }

    private String writeErrors(List<DataImportRowErrorDto> errors) {
        try {
            return objectMapper.writeValueAsString(errors == null ? List.of() : errors);
        } catch (JacksonException ex) {
            return "[]";
        }
    }
}
