package br.com.gommo.admin.modules.root.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Gera e faz hash de tokens de primeiro acesso / redefinicao de senha.
 * Token em texto claro: numero aleatorio de 8 digitos (ex.: 48392017).
 */
public final class AccessTokenSupport {

    private static final int TOKEN_DIGITS = 8;
    private static final int TOKEN_BOUND = 100_000_000;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private AccessTokenSupport() {}

    public static String generatePlainToken() {
        return String.format("%0" + TOKEN_DIGITS + "d", SECURE_RANDOM.nextInt(TOKEN_BOUND));
    }

    public static String hashToken(String plainToken) {
        String normalized = plainToken == null ? "" : plainToken.trim();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
