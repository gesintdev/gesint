package br.com.gommo.admin.core.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Cifra AES-GCM para segredos em repouso lidos tambem pelo Client (ex.: senha SMTP da plataforma).
 * Precisa derivar a chave exatamente como o {@code SecretEncryptionService} do gommo-backend:
 * {@code GOMMO_SECRET_ENCRYPTION_KEY} ou, em fallback, {@code JWT_SECRET}.
 */
@Service
public class SecretEncryptionService {

    private static final String AES_GCM_TRANSFORM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_BYTES = 12;

    private final byte[] keyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public SecretEncryptionService(
            @Value("${gommo-admin.security.secret-encryption-key:}") String encryptionKey,
            @Value("${gommo-admin.security.jwt.secret}") String jwtSecret) {
        String material = encryptionKey != null && !encryptionKey.isBlank() ? encryptionKey : jwtSecret;
        if (material == null || material.isBlank()) {
            throw new IllegalStateException(
                    "Defina GOMMO_SECRET_ENCRYPTION_KEY ou JWT_SECRET para cifrar segredos.");
        }
        this.keyBytes = sha256(material.getBytes(StandardCharsets.UTF_8));
    }

    public byte[] encryptString(String plain) {
        if (plain == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(AES_GCM_TRANSFORM);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] cipherText = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            return ByteBuffer.allocate(iv.length + cipherText.length).put(iv).put(cipherText).array();
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Falha ao cifrar segredo.", ex);
        }
    }

    public String decryptString(byte[] payload) {
        if (payload == null || payload.length <= IV_BYTES) {
            throw new IllegalArgumentException("Payload cifrado invalido.");
        }
        try {
            byte[] iv = Arrays.copyOfRange(payload, 0, IV_BYTES);
            byte[] cipherText = Arrays.copyOfRange(payload, IV_BYTES, payload.length);
            Cipher cipher = Cipher.getInstance(AES_GCM_TRANSFORM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Falha ao decifrar segredo.", ex);
        }
    }

    private static byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("SHA-256 indisponivel.", ex);
        }
    }
}
