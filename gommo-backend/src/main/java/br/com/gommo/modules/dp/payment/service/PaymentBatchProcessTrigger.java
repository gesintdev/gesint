package br.com.gommo.modules.dp.payment.service;

import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class PaymentBatchProcessTrigger {

    private final PaymentBatchAsyncProcessor asyncProcessor;

    public PaymentBatchProcessTrigger(PaymentBatchAsyncProcessor asyncProcessor) {
        this.asyncProcessor = asyncProcessor;
    }

    public void scheduleAfterCommit(UUID batchId, byte[] sourceBytes) {
        TenantContext tenantContext = TenantContextHolder.getOptional().orElse(null);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    asyncProcessor.processBatch(batchId, sourceBytes, tenantContext);
                }
            });
            return;
        }
        asyncProcessor.processBatch(batchId, sourceBytes, tenantContext);
    }
}
