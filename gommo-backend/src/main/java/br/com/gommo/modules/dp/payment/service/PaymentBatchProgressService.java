package br.com.gommo.modules.dp.payment.service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.payment.entity.PaymentBatch;
import br.com.gommo.modules.dp.payment.exception.PaymentException;
import br.com.gommo.modules.dp.payment.repository.PaymentBatchRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentBatchProgressService {

    private final PaymentBatchRepository batchRepository;

    public PaymentBatchProgressService(PaymentBatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void setTotalPages(UUID batchId, int totalPages) {
        PaymentBatch batch = findBatch(batchId);
        batch.setTotalPages(totalPages);
        batch.setProcessingPage(0);
        batchRepository.save(batch);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateProcessingPage(UUID batchId, int processingPage) {
        PaymentBatch batch = findBatch(batchId);
        batch.setProcessingPage(processingPage);
        batchRepository.save(batch);
    }

    private PaymentBatch findBatch(UUID batchId) {
        return batchRepository.findByIdAndStatusNot(batchId, StatusEnum.DELETED).orElseThrow(PaymentException::notFound);
    }
}
