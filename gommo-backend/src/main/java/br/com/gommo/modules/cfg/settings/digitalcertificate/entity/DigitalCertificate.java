package br.com.gommo.modules.cfg.settings.digitalcertificate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "digital_certificate")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class DigitalCertificate extends BranchScopedEntity {

    @Column(nullable = false, length = 120)
    private String alias;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "certificate_type", nullable = false, columnDefinition = "digital_certificate_type_enum")
    @Builder.Default
    private DigitalCertificateTypeEnum certificateType = DigitalCertificateTypeEnum.A1;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "digital_certificate_purpose_enum")
    @Builder.Default
    private DigitalCertificatePurposeEnum purpose = DigitalCertificatePurposeEnum.ESOCIAL;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "digital_certificate_environment_enum")
    @Builder.Default
    private DigitalCertificateEnvironmentEnum environment = DigitalCertificateEnvironmentEnum.HOMOLOGATION;

    @Column(name = "owner_document", length = 20)
    private String ownerDocument;

    @Column(name = "subject_name", length = 255)
    private String subjectName;

    @Column(name = "issuer_name", length = 255)
    private String issuerName;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(length = 128)
    private String thumbprint;

    @Column(name = "valid_from")
    private OffsetDateTime validFrom;

    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    /** Material criptografico fica fora do historico: so a versao vigente pode existir. */
    @NotAudited
    @Column(name = "pkcs12_encrypted", nullable = false, columnDefinition = "BYTEA")
    private byte[] pkcs12Encrypted;

    @NotAudited
    @Column(name = "password_encrypted", nullable = false, columnDefinition = "BYTEA")
    private byte[] passwordEncrypted;
}
