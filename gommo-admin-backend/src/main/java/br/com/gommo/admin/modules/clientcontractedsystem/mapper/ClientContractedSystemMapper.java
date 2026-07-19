package br.com.gommo.admin.modules.clientcontractedsystem.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemRequestDto;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemResponseDto;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.ClientContractedSystem;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.ContractTypeEnum;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.OperationalStatusEnum;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.SessionPolicyEnum;
import br.com.gommo.admin.modules.productsystem.entity.ProductSystem;

@Component
public class ClientContractedSystemMapper {

    public ClientContractedSystem toEntity(ClientContractedSystemRequestDto dto, ProductSystem productSystem) {
        return ClientContractedSystem.builder()
                .clientId(dto.getClientId())
                .productSystemId(productSystem.getId())
                .name(productSystem.getName())
                .moduleName(productSystem.getKey())
                .operationalStatus(resolveOperationalStatus(dto.getOperationalStatus()))
                .statusDate(dto.getStatusDate())
                .returnDate(dto.getReturnDate())
                .negotiatedAmount(
                        dto.getNegotiatedAmount() != null ? dto.getNegotiatedAmount() : productSystem.getDefaultPrice())
                .discountPercent(dto.getDiscountPercent())
                .agreedAmount(dto.getAgreedAmount())
                .contractType(resolveContractType(dto.getContractType()))
                .contractDate(dto.getContractDate())
                .endDate(dto.getEndDate())
                .dueDay(dto.getDueDay())
                .lateTolerance(dto.getLateTolerance())
                .withAi(resolveWithAi(dto.getWithAi(), productSystem))
                .effectiveFrom(dto.getEffectiveFrom())
                .deactivateAt(dto.getDeactivateAt())
                .sessionPolicy(resolveSessionPolicy(dto.getSessionPolicy()))
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(
            ClientContractedSystem entity, ClientContractedSystemRequestDto dto, ProductSystem productSystem) {
        entity.setClientId(dto.getClientId());
        entity.setProductSystemId(productSystem.getId());
        entity.setName(productSystem.getName());
        entity.setModuleName(productSystem.getKey());
        entity.setOperationalStatus(resolveOperationalStatus(dto.getOperationalStatus()));
        entity.setStatusDate(dto.getStatusDate());
        entity.setReturnDate(dto.getReturnDate());
        entity.setNegotiatedAmount(dto.getNegotiatedAmount());
        entity.setDiscountPercent(dto.getDiscountPercent());
        entity.setAgreedAmount(dto.getAgreedAmount());
        entity.setContractType(resolveContractType(dto.getContractType()));
        entity.setContractDate(dto.getContractDate());
        entity.setEndDate(dto.getEndDate());
        entity.setDueDay(dto.getDueDay());
        entity.setLateTolerance(dto.getLateTolerance());
        entity.setWithAi(resolveWithAi(dto.getWithAi(), productSystem));
        entity.setEffectiveFrom(dto.getEffectiveFrom());
        entity.setDeactivateAt(dto.getDeactivateAt());
        entity.setSessionPolicy(resolveSessionPolicy(dto.getSessionPolicy()));
        entity.setNotes(dto.getNotes());
    }

    public ClientContractedSystemResponseDto toResponse(ClientContractedSystem entity, ProductSystem productSystem) {
        return ClientContractedSystemResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .clientId(entity.getClientId())
                .productSystemId(entity.getProductSystemId())
                .productSystemKey(productSystem != null ? productSystem.getKey() : entity.getModuleName())
                .name(entity.getName())
                .moduleName(entity.getModuleName())
                .operationalStatus(entity.getOperationalStatus().name())
                .statusDate(entity.getStatusDate())
                .returnDate(entity.getReturnDate())
                .negotiatedAmount(entity.getNegotiatedAmount())
                .discountPercent(entity.getDiscountPercent())
                .agreedAmount(entity.getAgreedAmount())
                .contractType(entity.getContractType() != null ? entity.getContractType().name() : null)
                .contractDate(entity.getContractDate())
                .endDate(entity.getEndDate())
                .dueDay(entity.getDueDay())
                .lateTolerance(entity.getLateTolerance())
                .withAi(entity.isWithAi())
                .effectiveFrom(entity.getEffectiveFrom())
                .deactivateAt(entity.getDeactivateAt())
                .sessionPolicy(
                        entity.getSessionPolicy() != null
                                ? entity.getSessionPolicy().name()
                                : SessionPolicyEnum.KEEP_UNTIL_EXPIRY.name())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private OperationalStatusEnum resolveOperationalStatus(String value) {
        if (value == null || value.isBlank()) {
            return OperationalStatusEnum.ACTIVE;
        }
        return OperationalStatusEnum.valueOf(value);
    }

    private ContractTypeEnum resolveContractType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return ContractTypeEnum.valueOf(value);
    }

    private boolean resolveWithAi(Boolean withAi, ProductSystem productSystem) {
        if (withAi != null) {
            return withAi;
        }
        return productSystem.isWithAiAvailable();
    }

    private SessionPolicyEnum resolveSessionPolicy(String value) {
        if (value == null || value.isBlank()) {
            return SessionPolicyEnum.KEEP_UNTIL_EXPIRY;
        }
        return SessionPolicyEnum.valueOf(value);
    }
}
