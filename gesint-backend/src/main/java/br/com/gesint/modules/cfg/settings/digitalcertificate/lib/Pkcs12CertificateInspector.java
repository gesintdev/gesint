package br.com.gesint.modules.cfg.settings.digitalcertificate.lib;

import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.cert.X509Certificate;
import java.time.ZoneOffset;
import java.util.Enumeration;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import br.com.gesint.core.exception.BusinessException;
import br.com.gesint.modules.cfg.settings.digitalcertificate.exception.DigitalCertificateException;

public final class Pkcs12CertificateInspector {

    private static final Pattern DIGITS = Pattern.compile("\\d{11,14}");

    private Pkcs12CertificateInspector() {}

    public record InspectedCertificate(
            String subjectName,
            String issuerName,
            String serialNumber,
            String thumbprint,
            String ownerDocument,
            java.time.OffsetDateTime validFrom,
            java.time.OffsetDateTime validUntil) {}

    public static InspectedCertificate inspect(byte[] pkcs12Bytes, char[] password) {
        try {
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            keyStore.load(new ByteArrayInputStream(pkcs12Bytes), password);
            String alias = firstKeyAlias(keyStore);
            if (alias == null) {
                throw DigitalCertificateException.invalidPkcs12();
            }
            X509Certificate certificate = (X509Certificate) keyStore.getCertificate(alias);
            if (certificate == null) {
                throw DigitalCertificateException.invalidPkcs12();
            }
            String subject = certificate.getSubjectX500Principal().getName();
            String issuer = certificate.getIssuerX500Principal().getName();
            String serial = certificate.getSerialNumber().toString(16).toUpperCase();
            String thumbprint = sha1Hex(certificate.getEncoded());
            return new InspectedCertificate(
                    subject,
                    issuer,
                    serial,
                    thumbprint,
                    extractDocument(subject),
                    certificate.getNotBefore().toInstant().atOffset(ZoneOffset.UTC),
                    certificate.getNotAfter().toInstant().atOffset(ZoneOffset.UTC));
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw DigitalCertificateException.invalidPkcs12();
        }
    }

    private static String firstKeyAlias(KeyStore keyStore) throws Exception {
        Enumeration<String> aliases = keyStore.aliases();
        String firstCertificateAlias = null;
        while (aliases.hasMoreElements()) {
            String alias = aliases.nextElement();
            if (keyStore.isKeyEntry(alias)) {
                return alias;
            }
            if (firstCertificateAlias == null && keyStore.isCertificateEntry(alias)) {
                firstCertificateAlias = alias;
            }
        }
        return firstCertificateAlias;
    }

    private static String sha1Hex(byte[] encoded) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-1").digest(encoded);
        return HexFormat.of().withUpperCase().formatHex(digest);
    }

    private static String extractDocument(String subject) {
        if (subject == null || subject.isBlank()) {
            return null;
        }
        Matcher matcher = DIGITS.matcher(subject.replaceAll("[.:\\-/\\s]", ""));
        if (matcher.find()) {
            return matcher.group();
        }
        matcher = DIGITS.matcher(subject);
        return matcher.find() ? matcher.group().replaceAll("\\D", "") : null;
    }
}
