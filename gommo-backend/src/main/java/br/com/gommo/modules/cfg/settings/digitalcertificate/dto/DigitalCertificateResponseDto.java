package br.com.gommo.modules.cfg.settings.digitalcertificate.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateEnvironmentEnum;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificatePurposeEnum;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateTypeEnum;

@Getter
@Builder
public class DigitalCertificateResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String alias;
    private final DigitalCertificateTypeEnum certificateType;
    private final DigitalCertificatePurposeEnum purpose;
    private final DigitalCertificateEnvironmentEnum environment;
    private final String ownerDocument;
    private final String subjectName;
    private final String issuerName;
    private final String serialNumber;
    private final String thumbprint;
    private final OffsetDateTime validFrom;
    private final OffsetDateTime validUntil;
    private final Boolean isDefault;
    private final Boolean expired;
    private final Boolean certificateUploaded;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
