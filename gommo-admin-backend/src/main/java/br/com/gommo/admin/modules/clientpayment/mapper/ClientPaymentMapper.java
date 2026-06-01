package br.com.gommo.admin.modules.clientpayment.mapper;

import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentRequestDto;
import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentResponseDto;
import br.com.gommo.admin.modules.clientpayment.entity.ClientPayment;
import br.com.gommo.admin.modules.clientpayment.entity.PaymentStatusEnum;
import org.springframework.stereotype.Component;

@Component
public class ClientPaymentMapper {

    public ClientPayment toEntity(ClientPaymentRequestDto dto) {
        return ClientPayment.builder()
                .clientId(dto.getClientId())
                .referenceCode(dto.getReferenceCode())
                .amount(dto.getAmount())
                .dueDate(dto.getDueDate())
                .paidAt(dto.getPaidAt())
                .paymentStatus(resolvePaymentStatus(dto.getPaymentStatus()))
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(ClientPayment entity, ClientPaymentRequestDto dto) {
        entity.setClientId(dto.getClientId());
        entity.setReferenceCode(dto.getReferenceCode());
        entity.setAmount(dto.getAmount());
        entity.setDueDate(dto.getDueDate());
        entity.setPaidAt(dto.getPaidAt());
        entity.setPaymentStatus(resolvePaymentStatus(dto.getPaymentStatus()));
        entity.setNotes(dto.getNotes());
    }

    public ClientPaymentResponseDto toResponse(ClientPayment entity) {
        return ClientPaymentResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .clientId(entity.getClientId())
                .referenceCode(entity.getReferenceCode())
                .amount(entity.getAmount())
                .dueDate(entity.getDueDate())
                .paidAt(entity.getPaidAt())
                .paymentStatus(entity.getPaymentStatus().name())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private PaymentStatusEnum resolvePaymentStatus(String value) {
        if (value == null || value.isBlank()) {
            return PaymentStatusEnum.PENDING;
        }
        return PaymentStatusEnum.valueOf(value);
    }
}
