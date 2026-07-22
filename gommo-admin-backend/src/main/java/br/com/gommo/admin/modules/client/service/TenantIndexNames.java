package br.com.gommo.admin.modules.client.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * PostgreSQL limita identificadores a 63 bytes. Schemas longos (tenant_nome_cpf...)
 * faziam uk_{schema}_permission_code e uk_{schema}_permission_authority truncarem
 * para o mesmo nome e quebrarem o provisionamento.
 */
final class TenantIndexNames {

    private static final int PG_MAX_IDENTIFIER = 63;

    private TenantIndexNames() {}

    static String unique(String prefix, String schema, String suffix) {
        String schemaToken = schema.replace('.', '_');
        String full = prefix + "_" + schemaToken + "_" + suffix;
        if (full.length() <= PG_MAX_IDENTIFIER) {
            return full;
        }

        String hash = shortHash(schemaToken);
        String compact = prefix + "_" + hash + "_" + suffix;
        if (compact.length() <= PG_MAX_IDENTIFIER) {
            return compact;
        }

        int maxSuffix = PG_MAX_IDENTIFIER - (prefix.length() + 1 + hash.length() + 1);
        String trimmedSuffix = suffix.substring(0, Math.max(1, maxSuffix));
        return prefix + "_" + hash + "_" + trimmedSuffix;
    }

    private static String shortHash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 10);
        } catch (NoSuchAlgorithmException ex) {
            return Integer.toHexString(value.hashCode());
        }
    }
}
