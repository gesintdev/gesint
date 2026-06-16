package br.com.gommo.modules.payment.service;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payment.dto.PaymentBatchProcessResponseDto;
import br.com.gommo.modules.payment.dto.PaymentBatchResponseDto;
import br.com.gommo.modules.payment.dto.PaymentSlipResponseDto;
import br.com.gommo.modules.payment.dto.PaymentSlipSendResponseDto;
import br.com.gommo.modules.payment.entity.PaymentBatch;
import br.com.gommo.modules.payment.entity.PaymentBatchStatusEnum;
import br.com.gommo.modules.payment.entity.PaymentBatchTypeEnum;
import br.com.gommo.modules.payment.entity.PaymentPeriod;
import br.com.gommo.modules.payment.entity.PaymentSlip;
import br.com.gommo.modules.payment.entity.PaymentSlipStatusEnum;
import br.com.gommo.modules.payment.exception.PaymentException;
import br.com.gommo.modules.payment.mapper.PaymentMapper;
import br.com.gommo.modules.payment.notification.PaymentSlipNotificationService;
import br.com.gommo.modules.payment.pdf.PaymentReceiptPdfParser;
import br.com.gommo.modules.payment.repository.PaymentBatchRepository;
import br.com.gommo.modules.payment.repository.PaymentPeriodRepository;
import br.com.gommo.modules.payment.repository.PaymentSlipRepository;
import br.com.gommo.modules.payment.storage.PaymentFileStorageHelper;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PaymentBatchService implements IPaymentBatchService {

    private static final DateTimeFormatter PERIOD_LABEL =
            DateTimeFormatter.ofPattern("MM/yyyy", Locale.forLanguageTag("pt-BR"));

    private final PaymentPeriodRepository periodRepository;
    private final PaymentBatchRepository batchRepository;
    private final PaymentSlipRepository slipRepository;
    private final PaymentMapper mapper;
    private final PaymentFileStorageHelper fileStorageHelper;
    private final PaymentCollaboratorResolver collaboratorResolver;
    private final PaymentSlipNotificationService notificationService;
    private final PaymentBatchProcessTrigger processTrigger;
    private final PaymentReceiptPdfParser pdfParser;
    private final PaymentPersonNameFormatter personNameFormatter;

    public PaymentBatchService(
            PaymentPeriodRepository periodRepository,
            PaymentBatchRepository batchRepository,
            PaymentSlipRepository slipRepository,
            PaymentMapper mapper,
            PaymentReceiptPdfParser pdfParser,
            PaymentFileStorageHelper fileStorageHelper,
            PaymentCollaboratorResolver collaboratorResolver,
            PaymentSlipNotificationService notificationService,
            PaymentBatchProcessTrigger processTrigger,
            PaymentPersonNameFormatter personNameFormatter) {
        this.periodRepository = periodRepository;
        this.batchRepository = batchRepository;
        this.slipRepository = slipRepository;
        this.mapper = mapper;
        this.pdfParser = pdfParser;
        this.fileStorageHelper = fileStorageHelper;
        this.collaboratorResolver = collaboratorResolver;
        this.notificationService = notificationService;
        this.processTrigger = processTrigger;
        this.personNameFormatter = personNameFormatter;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payment:read')")
    public List<PaymentBatchResponseDto> findByPeriod(UUID periodId) {
        findPeriod(periodId);
        return batchRepository.findByPaymentPeriodIdAndStatusNotOrderByCreatedAtDesc(periodId, StatusEnum.DELETED).stream()
                .map(mapper::toBatchResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentBatchProcessResponseDto uploadAndProcess(UUID periodId, MultipartFile file, String description) {
        findPeriod(periodId);
        if (file == null || file.isEmpty()) {
            throw PaymentException.batchProcessingFailed();
        }
        try {
            byte[] sourceBytes = file.getBytes();
            String sourceFileName = normalizeSourceFileName(file.getOriginalFilename());
            if (sourceFileName.isBlank()) {
                throw PaymentException.batchProcessingFailed();
            }
            if (batchRepository.existsByPaymentPeriodIdAndSourceFileNameIgnoreCaseAndStatusNot(
                    periodId, sourceFileName, StatusEnum.DELETED)) {
                throw PaymentException.duplicateSourceFile();
            }
            UUID sourceObjectId = fileStorageHelper.storePdfBytes(sourceBytes, sourceFileName);
            int totalPages = pdfParser.countPages(sourceBytes);

            PaymentBatch batch = PaymentBatch.builder()
                    .paymentPeriodId(periodId)
                    .batchType(PaymentBatchTypeEnum.SALARY)
                    .description(description)
                    .sourceObjectId(sourceObjectId)
                    .sourceFileName(sourceFileName)
                    .batchStatus(PaymentBatchStatusEnum.PROCESSING)
                    .itemCount(0)
                    .divergentCount(0)
                    .sentCount(0)
                    .totalPages(totalPages)
                    .processingPage(0)
                    .build();
            batch.setStatus(StatusEnum.ACTIVE);
            batch = batchRepository.save(batch);

            processTrigger.scheduleAfterCommit(batch.getId(), sourceBytes);

            return PaymentBatchProcessResponseDto.builder()
                    .batch(mapper.toBatchResponse(batch))
                    .processedCount(0)
                    .divergentCount(0)
                    .build();
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw PaymentException.batchProcessingFailed();
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:delete')")
    public void delete(UUID batchId) {
        PaymentBatch batch = findBatch(batchId);
        batch.setStatus(StatusEnum.DELETED);
        batchRepository.save(batch);
        List<PaymentSlip> slips =
                slipRepository.findByPaymentBatchIdAndStatusNotOrderByExtractedNameAsc(batchId, StatusEnum.DELETED);
        for (PaymentSlip slip : slips) {
            slip.setStatus(StatusEnum.DELETED);
        }
        slipRepository.saveAll(slips);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('payment:read')")
    public List<PaymentSlipResponseDto> findSlips(UUID batchId, PaymentSlipStatusEnum status) {
        findBatch(batchId);
        List<PaymentSlip> slips;
        if (status == null) {
            slips = slipRepository.findByPaymentBatchIdAndStatusNotOrderByExtractedNameAsc(batchId, StatusEnum.DELETED);
        } else {
            slips = slipRepository.findByPaymentBatchIdAndSlipStatusAndStatusNotOrderByExtractedNameAsc(
                    batchId, status, StatusEnum.DELETED);
        }
        List<PaymentSlipResponseDto> result = new ArrayList<>(slips.size());
        for (PaymentSlip slip : slips) {
            result.add(toSlipResponse(slip));
        }
        result.sort(Comparator.comparing(this::slipSortKey, String.CASE_INSENSITIVE_ORDER));
        return result;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentSlipSendResponseDto sendEmail(UUID slipId) {
        PaymentSlip slip = findSlip(slipId);
        assertSendable(slip);
        Collaborator collaborator = collaboratorResolver
                .findEntity(slip.getCollaboratorId())
                .orElseThrow(PaymentException::slipNotSendable);
        PaymentCollaboratorResolver.ContactInfo contact = collaboratorResolver.resolveContact(collaborator.getId());
        PaymentPeriod period = findPeriod(findBatch(slip.getPaymentBatchId()).getPaymentPeriodId());
        String periodLabel = PERIOD_LABEL.format(period.getReferenceDate());
        byte[] pdfBytes = fileStorageHelper.readBytes(slip.getSlipObjectId());
        notificationService.sendEmail(
                contact.email(),
                collaborator.getFullName(),
                periodLabel,
                pdfBytes,
                buildSlipFilename(slip.getExtractedName(), slip.getPageNumber()));

        OffsetDateTime now = OffsetDateTime.now();
        slip.setEmailSentAt(now);
        markSentIfNeeded(slip, now);
        slipRepository.save(slip);
        refreshBatchCounters(slip.getPaymentBatchId());

        return PaymentSlipSendResponseDto.builder()
                .slip(toSlipResponse(slip))
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentSlipSendResponseDto sendWhatsapp(UUID slipId) {
        PaymentSlip slip = findSlip(slipId);
        assertSendable(slip);
        Collaborator collaborator = collaboratorResolver
                .findEntity(slip.getCollaboratorId())
                .orElseThrow(PaymentException::slipNotSendable);
        PaymentCollaboratorResolver.ContactInfo contact = collaboratorResolver.resolveContact(collaborator.getId());
        PaymentPeriod period = findPeriod(findBatch(slip.getPaymentBatchId()).getPaymentPeriodId());
        String periodLabel = PERIOD_LABEL.format(period.getReferenceDate());
        String whatsappUrl = notificationService.buildWhatsappUrl(
                contact.phone(), collaborator.getFullName(), periodLabel);

        OffsetDateTime now = OffsetDateTime.now();
        slip.setWhatsappSentAt(now);
        markSentIfNeeded(slip, now);
        slipRepository.save(slip);
        refreshBatchCounters(slip.getPaymentBatchId());

        return PaymentSlipSendResponseDto.builder()
                .slip(toSlipResponse(slip))
                .whatsappUrl(whatsappUrl)
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public int sendAllProcessed(UUID batchId) {
        List<PaymentSlip> slips = slipRepository.findByPaymentBatchIdAndSlipStatusAndStatusNotOrderByExtractedNameAsc(
                batchId, PaymentSlipStatusEnum.PROCESSED, StatusEnum.DELETED);
        int sent = 0;
        for (PaymentSlip slip : slips) {
            try {
                sendEmail(slip.getId());
                sent++;
            } catch (RuntimeException ignored) {
                // keep going for remaining slips
            }
        }
        return sent;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payment:write')")
    public PaymentSlipResponseDto validateSlip(UUID slipId) {
        PaymentSlip slip = findSlip(slipId);
        if (slip.getSlipStatus() != PaymentSlipStatusEnum.DIVERGENT || slip.getCollaboratorId() == null) {
            throw PaymentException.slipNotValidatable();
        }
        slip.setSlipStatus(PaymentSlipStatusEnum.PROCESSED);
        slipRepository.save(slip);
        refreshDivergentCount(slip.getPaymentBatchId());
        return toSlipResponse(slip);
    }

    private PaymentSlipResponseDto toSlipResponse(PaymentSlip slip) {
        String name = null;
        String email = null;
        String phone = null;
        if (slip.getCollaboratorId() != null) {
            var collaborator = collaboratorResolver.findEntity(slip.getCollaboratorId());
            if (collaborator.isPresent()) {
                name = collaborator.get().getFullName();
                var contact = collaboratorResolver.resolveContact(collaborator.get().getId());
                email = contact.email();
                phone = contact.phone();
            }
        }
        return mapper.toSlipResponse(
                slip,
                name,
                personNameFormatter.formatForDisplay(name),
                personNameFormatter.formatForDisplay(slip.getExtractedName()),
                email,
                phone);
    }

    private void refreshDivergentCount(UUID batchId) {
        PaymentBatch batch = findBatch(batchId);
        long divergent = slipRepository.countByPaymentBatchIdAndSlipStatusAndStatusNot(
                batchId, PaymentSlipStatusEnum.DIVERGENT, StatusEnum.DELETED);
        batch.setDivergentCount((int) divergent);
        batchRepository.save(batch);
    }

    private void assertSendable(PaymentSlip slip) {
        if (slip.getSlipStatus() != PaymentSlipStatusEnum.PROCESSED || slip.getCollaboratorId() == null) {
            throw PaymentException.slipNotSendable();
        }
    }

    private void markSentIfNeeded(PaymentSlip slip, OffsetDateTime now) {
        if (slip.getSlipStatus() == PaymentSlipStatusEnum.PROCESSED) {
            slip.setSlipStatus(PaymentSlipStatusEnum.SENT);
            slip.setSentAt(now);
        }
    }

    private void refreshBatchCounters(UUID batchId) {
        PaymentBatch batch = findBatch(batchId);
        long sent = slipRepository.countByPaymentBatchIdAndSlipStatusAndStatusNot(
                batchId, PaymentSlipStatusEnum.SENT, StatusEnum.DELETED);
        batch.setSentCount((int) sent);
        long processed = slipRepository.countByPaymentBatchIdAndSlipStatusAndStatusNot(
                batchId, PaymentSlipStatusEnum.PROCESSED, StatusEnum.DELETED);
        if (sent > 0 && processed == 0) {
            batch.setBatchStatus(PaymentBatchStatusEnum.SENT);
        } else if (sent > 0) {
            batch.setBatchStatus(PaymentBatchStatusEnum.PARTIALLY_SENT);
        }
        batchRepository.save(batch);
    }

    private PaymentPeriod findPeriod(UUID periodId) {
        return periodRepository.findByIdAndStatusNot(periodId, StatusEnum.DELETED).orElseThrow(PaymentException::notFound);
    }

    private PaymentBatch findBatch(UUID batchId) {
        return batchRepository.findByIdAndStatusNot(batchId, StatusEnum.DELETED).orElseThrow(PaymentException::notFound);
    }

    private PaymentSlip findSlip(UUID slipId) {
        return slipRepository.findByIdAndStatusNot(slipId, StatusEnum.DELETED).orElseThrow(PaymentException::notFound);
    }

    private String buildSlipFilename(String extractedName, int pageNumber) {
        String safe = extractedName == null ? "holerite" : extractedName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return "holerite-" + safe + "-p" + pageNumber + ".pdf";
    }

    private String normalizeSourceFileName(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        return originalFilename.trim();
    }

    private String slipSortKey(PaymentSlipResponseDto slip) {
        if (slip.getSlipStatus() == PaymentSlipStatusEnum.DIVERGENT
                || slip.getSlipStatus() == PaymentSlipStatusEnum.NOT_FOUND) {
            return firstNonBlank(slip.getExtractedNameDisplay(), slip.getExtractedName());
        }
        return firstNonBlank(
                slip.getCollaboratorNameDisplay(), slip.getExtractedNameDisplay(), slip.getExtractedName());
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
