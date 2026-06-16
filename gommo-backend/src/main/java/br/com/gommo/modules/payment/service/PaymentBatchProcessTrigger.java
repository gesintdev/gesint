package br.com.gommo.modules.payment.service;

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
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    asyncProcessor.processBatch(batchId, sourceBytes);
                }
            });
            return;
        }
        asyncProcessor.processBatch(batchId, sourceBytes);
    }
}
