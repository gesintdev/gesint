package br.com.gommo.admin.modules.clientsubscription.mapper;

import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionRequestDto;
import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionResponseDto;
import br.com.gommo.admin.modules.clientsubscription.entity.BillingStatusEnum;
import br.com.gommo.admin.modules.clientsubscription.entity.ClientSubscription;
import org.springframework.stereotype.Component;

@Component
public class ClientSubscriptionMapper {

    public ClientSubscription toEntity(ClientSubscriptionRequestDto dto) {
        return ClientSubscription.builder()
                .clientId(dto.getClientId())
                .planCode(dto.getPlanCode())
                .billingStatus(resolveBillingStatus(dto.getBillingStatus()))
                .startedAt(dto.getStartedAt())
                .endsAt(dto.getEndsAt())
                .monthlyAmount(dto.getMonthlyAmount())
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(ClientSubscription entity, ClientSubscriptionRequestDto dto) {
        entity.setClientId(dto.getClientId());
        entity.setPlanCode(dto.getPlanCode());
        entity.setBillingStatus(resolveBillingStatus(dto.getBillingStatus()));
        entity.setStartedAt(dto.getStartedAt());
        entity.setEndsAt(dto.getEndsAt());
        entity.setMonthlyAmount(dto.getMonthlyAmount());
        entity.setNotes(dto.getNotes());
    }

    public ClientSubscriptionResponseDto toResponse(ClientSubscription entity) {
        return ClientSubscriptionResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .clientId(entity.getClientId())
                .planCode(entity.getPlanCode())
                .billingStatus(entity.getBillingStatus().name())
                .startedAt(entity.getStartedAt())
                .endsAt(entity.getEndsAt())
                .monthlyAmount(entity.getMonthlyAmount())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private BillingStatusEnum resolveBillingStatus(String value) {
        if (value == null || value.isBlank()) {
            return BillingStatusEnum.ACTIVE;
        }
        return BillingStatusEnum.valueOf(value);
    }
}
