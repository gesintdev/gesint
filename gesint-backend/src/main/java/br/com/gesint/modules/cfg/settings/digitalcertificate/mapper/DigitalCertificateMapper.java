package br.com.gesint.modules.cfg.settings.digitalcertificate.mapper;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateRequestDto;
import br.com.gesint.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateResponseDto;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificate;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateEnvironmentEnum;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificatePurposeEnum;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateTypeEnum;

@Component
public class DigitalCertificateMapper {

    public DigitalCertificateResponseDto toResponse(DigitalCertificate entity) {
        OffsetDateTime now = OffsetDateTime.now();
        boolean expired = entity.getValidUntil() != null && entity.getValidUntil().isBefore(now);
        return DigitalCertificateResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .alias(entity.getAlias())
                .certificateType(entity.getCertificateType())
                .purpose(entity.getPurpose())
                .environment(entity.getEnvironment())
                .ownerDocument(entity.getOwnerDocument())
                .subjectName(entity.getSubjectName())
                .issuerName(entity.getIssuerName())
                .serialNumber(entity.getSerialNumber())
                .thumbprint(entity.getThumbprint())
                .validFrom(entity.getValidFrom())
                .validUntil(entity.getValidUntil())
                .isDefault(Boolean.TRUE.equals(entity.getIsDefault()))
                .expired(expired)
                .certificateUploaded(entity.getPkcs12Encrypted() != null && entity.getPkcs12Encrypted().length > 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void applyMetadata(DigitalCertificate entity, DigitalCertificateRequestDto dto) {
        entity.setAlias(trim(dto.getAlias()));
        entity.setCertificateType(
                dto.getCertificateType() != null ? dto.getCertificateType() : DigitalCertificateTypeEnum.A1);
        entity.setPurpose(dto.getPurpose() != null ? dto.getPurpose() : DigitalCertificatePurposeEnum.ESOCIAL);
        entity.setEnvironment(
                dto.getEnvironment() != null
                        ? dto.getEnvironment()
                        : DigitalCertificateEnvironmentEnum.HOMOLOGATION);
        if (dto.getOwnerDocument() != null && !dto.getOwnerDocument().isBlank()) {
            entity.setOwnerDocument(dto.getOwnerDocument().replaceAll("\\D", ""));
        }
        entity.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
