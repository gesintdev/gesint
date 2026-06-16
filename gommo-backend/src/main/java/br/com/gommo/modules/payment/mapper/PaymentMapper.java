package br.com.gommo.modules.payment.mapper;

import br.com.gommo.modules.payment.dto.PaymentBatchResponseDto;
import br.com.gommo.modules.payment.dto.PaymentPeriodRequestDto;
import br.com.gommo.modules.payment.dto.PaymentPeriodResponseDto;
import br.com.gommo.modules.payment.dto.PaymentSlipResponseDto;
import br.com.gommo.modules.payment.entity.PaymentBatch;
import br.com.gommo.modules.payment.entity.PaymentPeriod;
import br.com.gommo.modules.payment.entity.PaymentSlip;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentPeriod toEntity(PaymentPeriodRequestDto dto) {
        return PaymentPeriod.builder().referenceDate(dto.getReferenceDate()).notes(dto.getNotes()).build();
    }

    public void updatePeriod(PaymentPeriod entity, PaymentPeriodRequestDto dto) {
        entity.setReferenceDate(dto.getReferenceDate());
        entity.setNotes(dto.getNotes());
    }

    public PaymentPeriodResponseDto toPeriodResponse(PaymentPeriod entity) {
        return PaymentPeriodResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .referenceDate(entity.getReferenceDate())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PaymentBatchResponseDto toBatchResponse(PaymentBatch entity) {
        return PaymentBatchResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .paymentPeriodId(entity.getPaymentPeriodId())
                .batchType(entity.getBatchType())
                .description(entity.getDescription())
                .sourceObjectId(entity.getSourceObjectId())
                .batchStatus(entity.getBatchStatus())
                .itemCount(entity.getItemCount())
                .divergentCount(entity.getDivergentCount())
                .sentCount(entity.getSentCount())
                .processingPage(entity.getProcessingPage())
                .totalPages(entity.getTotalPages())
                .processedAt(entity.getProcessedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PaymentSlipResponseDto toSlipResponse(
            PaymentSlip entity,
            String collaboratorName,
            String collaboratorNameDisplay,
            String extractedNameDisplay,
            String collaboratorEmail,
            String collaboratorPhone) {
        return PaymentSlipResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .paymentBatchId(entity.getPaymentBatchId())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaboratorName)
                .collaboratorNameDisplay(collaboratorNameDisplay)
                .extractedName(entity.getExtractedName())
                .extractedNameDisplay(extractedNameDisplay)
                .slipObjectId(entity.getSlipObjectId())
                .slipStatus(entity.getSlipStatus())
                .pageNumber(entity.getPageNumber())
                .collaboratorEmail(collaboratorEmail)
                .collaboratorPhone(collaboratorPhone)
                .processedAt(entity.getProcessedAt())
                .sentAt(entity.getSentAt())
                .emailSentAt(entity.getEmailSentAt())
                .whatsappSentAt(entity.getWhatsappSentAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
