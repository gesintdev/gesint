package br.com.gommo.admin.modules.client.service;

import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TenantSchemaProvisioner {

    private static final Pattern SAFE_SCHEMA = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");

    private static final List<String> TENANT_TABLES = List.of(
            "company",
            "department",
            "job_position",
            "collaborator",
            "collaborator_address",
            "collaborator_contact",
            "employment_contract",
            "admission_process",
            "attendance_record",
            "benefit_plan",
            "benefit_enrollment",
            "leave_request",
            "offboarding",
            "exit_interview",
            "performance_review",
            "payroll_run",
            "payroll_event",
            "payslip",
            "payslip_entry",
            "storage_object",
            "storage_object_link",
            "tax_obligation",
            "audit_log");

    private final JdbcTemplate jdbcTemplate;

    public TenantSchemaProvisioner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void provisionDedicatedSchema(Client client) {
        if (client.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }

        String schema = requireSchema(client.getDatabaseSchema());
        if ("public".equalsIgnoreCase(schema)) {
            throw ClientException.databaseConfigIncomplete(
                    "Schema dedicado nao pode ser 'public'. Informe um schema exclusivo do tenant.");
        }

        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");

        for (String table : TENANT_TABLES) {
            if (!tenantTableExists(schema, table)) {
                jdbcTemplate.execute(
                        "CREATE TABLE \"" + schema + "\".\"" + table + "\" (LIKE public.\"" + table + "\" INCLUDING ALL)");
            }
        }
    }

    public static String defaultSchemaForSlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            return "public";
        }
        return "tenant_" + slug.trim().toLowerCase().replace('-', '_');
    }

    private boolean tenantTableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = ?
                      AND table_name = ?
                )
                """,
                Boolean.class,
                schema,
                table);
        return Boolean.TRUE.equals(exists);
    }

    private static String requireSchema(String schema) {
        if (!StringUtils.hasText(schema)) {
            throw ClientException.databaseConfigIncomplete("Schema do tenant e obrigatorio para DEDICATED_SCHEMA.");
        }
        String normalized = schema.trim();
        if (!SAFE_SCHEMA.matcher(normalized).matches()) {
            throw ClientException.databaseConfigIncomplete("Nome de schema invalido: " + schema);
        }
        return normalized;
    }
}
