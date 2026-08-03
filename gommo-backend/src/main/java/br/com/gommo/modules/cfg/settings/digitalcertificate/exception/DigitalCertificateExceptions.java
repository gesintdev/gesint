package br.com.gommo.modules.cfg.settings.digitalcertificate.exception;

public final class DigitalCertificateExceptions {

    private DigitalCertificateExceptions() {}

    public static final String NOT_FOUND_CODE = "DIGITAL_CERTIFICATE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Certificado digital nao encontrado.";

    public static final String INVALID_PKCS12_CODE = "DIGITAL_CERTIFICATE_INVALID_PKCS12";
    public static final String INVALID_PKCS12_MSG =
            "Nao foi possivel abrir o certificado. Verifique o arquivo .pfx/.p12 e a senha.";

    public static final String FILE_REQUIRED_CODE = "DIGITAL_CERTIFICATE_FILE_REQUIRED";
    public static final String FILE_REQUIRED_MSG = "Envie o arquivo do certificado A1 (.pfx ou .p12) e a senha.";

    public static final String DUPLICATE_CODE = "DIGITAL_CERTIFICATE_DUPLICATE";
    public static final String DUPLICATE_MSG = "Ja existe um certificado ativo com o mesmo thumbprint neste tenant.";

    public static final String A3_UNSUPPORTED_CODE = "DIGITAL_CERTIFICATE_A3_UNSUPPORTED";
    public static final String A3_UNSUPPORTED_MSG =
            "Certificado A3 (token/cartao) nao e suportado no SaaS nesta fase. Use certificado A1 (.pfx).";
}
