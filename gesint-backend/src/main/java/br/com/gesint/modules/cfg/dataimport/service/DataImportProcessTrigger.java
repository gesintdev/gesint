package br.com.gesint.modules.cfg.dataimport.service;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;

@Component
public class DataImportProcessTrigger {

    private final DataImportAsyncProcessor asyncProcessor;

    public DataImportProcessTrigger(DataImportAsyncProcessor asyncProcessor) {
        this.asyncProcessor = asyncProcessor;
    }

    public void scheduleAfterCommit(UUID jobId, byte[] fileBytes) {
        TenantContext tenantContext = TenantContextHolder.getOptional().orElse(null);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    asyncProcessor.process(jobId, fileBytes, tenantContext, authentication);
                }
            });
            return;
        }
        asyncProcessor.process(jobId, fileBytes, tenantContext, authentication);
    }
}
