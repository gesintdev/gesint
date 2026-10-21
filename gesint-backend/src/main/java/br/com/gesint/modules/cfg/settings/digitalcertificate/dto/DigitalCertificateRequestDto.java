package br.com.gesint.modules.cfg.settings.digitalcertificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateEnvironmentEnum;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificatePurposeEnum;
import br.com.gesint.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateTypeEnum;

@Getter
@Setter
public class DigitalCertificateRequestDto {

    @NotBlank
    @Size(max = 120)
    private String alias;

    private DigitalCertificateTypeEnum certificateType = DigitalCertificateTypeEnum.A1;

    private DigitalCertificatePurposeEnum purpose = DigitalCertificatePurposeEnum.ESOCIAL;

    private DigitalCertificateEnvironmentEnum environment = DigitalCertificateEnvironmentEnum.HOMOLOGATION;

    @Size(max = 20)
    private String ownerDocument;

    private Boolean isDefault = false;

    /** Conteudo PKCS#12 em Base64. Obrigatorio no create; opcional no update (substituicao). */
    private String pkcs12Base64;

    /** Senha do PKCS#12. Obrigatoria no create; obrigatoria no update se enviar novo arquivo. */
    private String password;
}
