package br.com.gommo.modules.dp.payment.service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.dp.payment.entity.PaymentBatchStatusEnum;
import br.com.gommo.modules.dp.payment.entity.PaymentSlip;
import br.com.gommo.modules.dp.payment.entity.PaymentSlipStatusEnum;
import br.com.gommo.modules.dp.payment.pdf.PaymentReceiptPdfParser;
import br.com.gommo.modules.dp.payment.pdf.PaymentReceiptPdfParser.ParsedPaymentPage;
import br.com.gommo.modules.dp.payment.repository.PaymentBatchRepository;
import br.com.gommo.modules.dp.payment.repository.PaymentSlipRepository;
import br.com.gommo.modules.dp.payment.service.PaymentNameMatcher.MatchResult;
import br.com.gommo.modules.dp.payment.service.PaymentNameMatcher.MatchType;
import br.com.gommo.modules.dp.payment.service.PaymentNameMatcher.NamedCollaborator;
import br.com.gommo.modules.dp.payment.storage.PaymentFileStorageHelper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class PaymentBatchAsyncProcessor {

    private static final Logger log = LoggerFactory.getLogger(PaymentBatchAsyncProcessor.class);

    private final PaymentBatchRepository batchRepository;
    private final PaymentSlipRepository slipRepository;
    private final PaymentReceiptPdfParser pdfParser;
    private final PaymentFileStorageHelper fileStorageHelper;
    private final PaymentCollaboratorResolver collaboratorResolver;
    private final PaymentBatchProgressService progressService;
    private final PaymentNameMatcher nameMatcher;
    private final MultiTenantProperties multiTenantProperties;

    public PaymentBatchAsyncProcessor(
            PaymentBatchRepository batchRepository,
            PaymentSlipRepository slipRepository,
            PaymentReceiptPdfParser pdfParser,
            PaymentFileStorageHelper fileStorageHelper,
            PaymentCollaboratorResolver collaboratorResolver,
            PaymentBatchProgressService progressService,
            PaymentNameMatcher nameMatcher,
            MultiTenantProperties multiTenantProperties) {
        this.batchRepository = batchRepository;
        this.slipRepository = slipRepository;
        this.pdfParser = pdfParser;
        this.fileStorageHelper = fileStorageHelper;
        this.collaboratorResolver = collaboratorResolver;
        this.progressService = progressService;
        this.nameMatcher = nameMatcher;
        this.multiTenantProperties = multiTenantProperties;
    }

    @Async("paymentBatchExecutor")
    public void processBatch(UUID batchId, byte[] sourceBytes, TenantContext capturedTenant) {
        if (!applyTenantContext(batchId, capturedTenant)) {
            return;
        }
        try (PDDocument document = Loader.loadPDF(sourceBytes)) {
            int pageCount = document.getNumberOfPages();

            Map<String, br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator> nameIndex =
                    collaboratorResolver.buildNameIndex();
            List<NamedCollaborator> namedCandidates = collaboratorResolver.buildNamedCandidates();
            int divergent = 0;
            int processed = 0;
            int notFound = 0;
            OffsetDateTime now = OffsetDateTime.now();

            for (int pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                ParsedPaymentPage page = pdfParser.parsePage(document, pageIndex);
                String extractedName = page.extractedName() != null ? page.extractedName() : "Nao identificado";
                MatchResult match = nameMatcher.match(extractedName, nameIndex, namedCandidates);
                UUID slipObjectId = fileStorageHelper.storePdfBytes(
                        page.pagePdfBytes(), buildSlipFilename(extractedName, page.pageNumber()));

                PaymentSlip slip = PaymentSlip.builder()
                        .paymentBatchId(batchId)
                        .extractedName(extractedName)
                        .slipObjectId(slipObjectId)
                        .pageNumber(page.pageNumber())
                        .processedAt(now)
                        .build();
                slip.setStatus(StatusEnum.ACTIVE);

                switch (match.type()) {
                    case EXACT -> {
                        slip.setCollaboratorId(match.collaborator().getId());
                        slip.setSlipStatus(PaymentSlipStatusEnum.PROCESSED);
                        processed++;
                    }
                    case FUZZY -> {
                        slip.setCollaboratorId(match.collaborator().getId());
                        slip.setSlipStatus(PaymentSlipStatusEnum.DIVERGENT);
                        divergent++;
                    }
                    case NONE -> {
                        slip.setSlipStatus(PaymentSlipStatusEnum.NOT_FOUND);
                        notFound++;
                    }
                }
                slipRepository.save(slip);
                progressService.updateProcessingPage(batchId, pageIndex + 1);
            }

            finalizeBatch(batchId, pageCount, divergent, now);
            log.info(
                    "Payment batch {} processed: {} pages, {} exact, {} divergent, {} not found",
                    batchId,
                    pageCount,
                    processed,
                    divergent,
                    notFound);
        } catch (Exception ex) {
            log.error("Payment batch {} processing failed", batchId, ex);
            markBatchFailed(batchId, "Erro no processamento");
        }
    }

    private boolean applyTenantContext(UUID batchId, TenantContext capturedTenant) {
        if (!multiTenantProperties.isEnabled()) {
            return true;
        }
        TenantContext tenant = capturedTenant != null
                ? capturedTenant
                : TenantContextHolder.getOptional().orElse(null);
        if (tenant == null) {
            log.error(
                    "Payment batch {} aborted: tenant context missing on async worker (schema isolation broken)",
                    batchId);
            markBatchFailed(batchId, "Contexto de tenant ausente no processamento");
            return false;
        }
        if (TenantContextHolder.getOptional().isEmpty()) {
            TenantContextHolder.set(tenant);
        }
        if (tenant.isPlatformAccess()) {
            log.debug("Payment batch {} processing on platform schema (public)", batchId);
        } else {
            log.debug("Payment batch {} processing on schema={}", batchId, tenant.schema());
        }
        return true;
    }

    private void finalizeBatch(UUID batchId, int pageCount, int divergent, OffsetDateTime processedAt) {
        batchRepository
                .findByIdAndStatusNot(batchId, StatusEnum.DELETED)
                .ifPresent(batch -> {
                    batch.setItemCount(pageCount);
                    batch.setDivergentCount(divergent);
                    batch.setProcessedAt(processedAt);
                    batch.setProcessingPage(pageCount);
                    batch.setBatchStatus(PaymentBatchStatusEnum.PROCESSED);
                    batchRepository.save(batch);
                });
    }

    private void markBatchFailed(UUID batchId, String reason) {
        batchRepository
                .findByIdAndStatusNot(batchId, StatusEnum.DELETED)
                .ifPresent(batch -> {
                    batch.setBatchStatus(PaymentBatchStatusEnum.PROCESSED);
                    batch.setDescription(
                            batch.getDescription() == null
                                    ? reason
                                    : batch.getDescription() + " (" + reason + ")");
                    batchRepository.save(batch);
                });
    }

    private String buildSlipFilename(String extractedName, int pageNumber) {
        String safe = extractedName == null ? "holerite" : extractedName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return "holerite-" + safe + "-p" + pageNumber + ".pdf";
    }
}
