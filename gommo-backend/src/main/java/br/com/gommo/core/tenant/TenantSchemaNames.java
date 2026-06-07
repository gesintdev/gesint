package br.com.gommo.core.tenant;

import java.util.regex.Pattern;

public final class TenantSchemaNames {

    private static final Pattern SAFE_SCHEMA = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");

    private TenantSchemaNames() {}

    public static String requireSafe(String schema) {
        if (schema == null || schema.isBlank()) {
            return "public";
        }
        if (!SAFE_SCHEMA.matcher(schema).matches()) {
            throw new IllegalArgumentException("Invalid tenant schema name");
        }
        return schema;
    }
}
