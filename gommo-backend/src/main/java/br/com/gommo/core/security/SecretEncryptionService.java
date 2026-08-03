package br.com.gommo.core.security;

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
 * Cifra simetrica AES-GCM para segredos em repouso (ex.: senha/PKCS#12 de certificado).
 * Chave derivada de {@code gommo.security.secret-encryption-key} ou, em fallback, do JWT secret.
 */
@Service
public class SecretEncryptionService {

    private static final String AES_GCM_TRANSFORM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_BYTES = 12;

    private final byte[] keyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public SecretEncryptionService(
            @Value("${gommo.security.secret-encryption-key:}") String encryptionKey,
            @Value("${gommo.security.jwt.secret}") String jwtSecret) {
        String material = encryptionKey != null && !encryptionKey.isBlank() ? encryptionKey : jwtSecret;
        if (material == null || material.isBlank()) {
            throw new IllegalStateException(
                    "Defina gommo.security.secret-encryption-key ou JWT_SECRET para cifrar segredos.");
        }
        this.keyBytes = sha256(material.getBytes(StandardCharsets.UTF_8));
    }

    public byte[] encrypt(byte[] plain) {
        if (plain == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(AES_GCM_TRANSFORM);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] cipherText = cipher.doFinal(plain);
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + cipherText.length);
            buffer.put(iv);
            buffer.put(cipherText);
            return buffer.array();
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Falha ao cifrar segredo.", ex);
        }
    }

    public byte[] encryptString(String plain) {
        if (plain == null) {
            return null;
        }
        return encrypt(plain.getBytes(StandardCharsets.UTF_8));
    }

    public byte[] decrypt(byte[] payload) {
        if (payload == null || payload.length <= IV_BYTES) {
            throw new IllegalArgumentException("Payload cifrado invalido.");
        }
        try {
            byte[] iv = Arrays.copyOfRange(payload, 0, IV_BYTES);
            byte[] cipherText = Arrays.copyOfRange(payload, IV_BYTES, payload.length);
            Cipher cipher = Cipher.getInstance(AES_GCM_TRANSFORM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(GCM_TAG_BITS, iv));
            return cipher.doFinal(cipherText);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Falha ao decifrar segredo.", ex);
        }
    }

    public String decryptString(byte[] payload) {
        return new String(decrypt(payload), StandardCharsets.UTF_8);
    }

    private static byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("SHA-256 indisponivel.", ex);
        }
    }
}
