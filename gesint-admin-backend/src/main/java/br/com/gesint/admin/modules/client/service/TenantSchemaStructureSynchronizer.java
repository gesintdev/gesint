package br.com.gesint.admin.modules.client.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import br.com.gesint.admin.modules.client.dto.TenantSchemaSyncResultDto;

/**
 * O schema public e o template do data plane: {@link TenantSchemaProvisioner} clona cada tabela
 * com {@code LIKE public.<tabela> INCLUDING ALL}. Isso cobre tenants novos, mas tenants ja
 * provisionados nunca recebem colunas/indices criados por migrations posteriores.
 *
 * Esta classe fecha essa lacuna comparando a estrutura do tenant com a de public e aplicando
 * o que falta. E idempotente e nao remove nada: colunas/indices que existem so no tenant sao
 * preservados.
 */
@Service
public class TenantSchemaStructureSynchronizer {

    private static final Logger log = LoggerFactory.getLogger(TenantSchemaStructureSynchronizer.class);

    private static final List<String> TENANT_TABLES = TenantSchemaTableCatalog.HR_DATA_TABLES;

    private final JdbcTemplate jdbcTemplate;

    public TenantSchemaStructureSynchronizer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public TenantSchemaSyncResultDto sync(String rawSchema) {
        String schema = TenantSchemaProvisioner.requireSafeSchema(rawSchema);
        if ("public".equalsIgnoreCase(schema)) {
            throw new IllegalArgumentException("Schema public e o template e nao pode ser sincronizado contra si mesmo.");
        }

        List<String> createdTables = new ArrayList<>();
        List<String> addedColumns = new ArrayList<>();
        List<String> createdIndexes = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        List<String> tables = new ArrayList<>(TENANT_TABLES);
        tables.add(TenantSchemaTableCatalog.AUDIT_REVISION_TABLE);
        tables.addAll(publicAuditTables());

        for (String table : tables) {
            if (!tableExists("public", table)) {
                warnings.add("Tabela ausente no template public: " + table);
                continue;
            }
            if (!tableExists(schema, table)) {
                jdbcTemplate.execute("CREATE TABLE \"" + schema + "\".\"" + table + "\" (LIKE public.\"" + table
                        + "\" INCLUDING ALL)");
                createdTables.add(table);
                continue;
            }
            syncColumns(schema, table, addedColumns, warnings);
            syncIndexes(schema, table, createdIndexes, warnings);
        }

        log.info(
                "Sync do schema {}: {} tabela(s), {} coluna(s), {} indice(s), {} aviso(s).",
                schema,
                createdTables.size(),
                addedColumns.size(),
                createdIndexes.size(),
                warnings.size());

        return TenantSchemaSyncResultDto.builder()
                .schema(schema)
                .createdTables(createdTables)
                .addedColumns(addedColumns)
                .createdIndexes(createdIndexes)
                .warnings(warnings)
                .build();
    }

    // --- colunas ---------------------------------------------------------------------------

    private void syncColumns(String schema, String table, List<String> addedColumns, List<String> warnings) {
        Map<String, ColumnDefinition> template = columnsOf("public", table);
        Set<String> existing = columnsOf(schema, table).keySet();

        for (ColumnDefinition column : template.values()) {
            if (existing.contains(column.name())) {
                continue;
            }
            StringBuilder ddl = new StringBuilder("ALTER TABLE \"" + schema + "\".\"" + table
                    + "\" ADD COLUMN IF NOT EXISTS \"" + column.name() + "\" " + column.type());
            if (column.defaultExpression() != null) {
                ddl.append(" DEFAULT ").append(column.defaultExpression());
            }
            jdbcTemplate.execute(ddl.toString());
            addedColumns.add(table + "." + column.name());

            if (!column.nullable()) {
                applyNotNull(schema, table, column, warnings);
            }
        }
    }

    /**
     * NOT NULL so e aplicado quando nao ha linha violando a restricao. Caso contrario a coluna
     * fica nullable e o backfill de dados fica registrado como aviso para tratamento explicito.
     */
    private void applyNotNull(String schema, String table, ColumnDefinition column, List<String> warnings) {
        Integer violations = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM \"" + schema + "\".\"" + table + "\" WHERE \"" + column.name() + "\" IS NULL",
                Integer.class);
        if (violations != null && violations > 0) {
            warnings.add("Coluna %s.%s criada como NULL: %d linha(s) exigem backfill antes do NOT NULL."
                    .formatted(table, column.name(), violations));
            return;
        }
        jdbcTemplate.execute("ALTER TABLE \"" + schema + "\".\"" + table + "\" ALTER COLUMN \"" + column.name()
                + "\" SET NOT NULL");
    }

    private Map<String, ColumnDefinition> columnsOf(String schema, String table) {
        Map<String, ColumnDefinition> columns = new LinkedHashMap<>();
        jdbcTemplate
                .query(
                        """
                        SELECT a.attname AS column_name,
                               format_type(a.atttypid, a.atttypmod) AS column_type,
                               a.attnotnull AS not_null,
                               pg_get_expr(d.adbin, d.adrelid) AS column_default
                          FROM pg_attribute a
                          LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
                         WHERE a.attrelid = to_regclass(?)::oid
                           AND a.attnum > 0
                           AND NOT a.attisdropped
                         ORDER BY a.attnum
                        """,
                        (rs, rowNum) -> new ColumnDefinition(
                                rs.getString("column_name"),
                                rs.getString("column_type"),
                                !rs.getBoolean("not_null"),
                                rs.getString("column_default")),
                        quoted(schema, table))
                .forEach(column -> columns.put(column.name(), column));
        return columns;
    }

    // --- indices ---------------------------------------------------------------------------

    private void syncIndexes(String schema, String table, List<String> createdIndexes, List<String> warnings) {
        Set<String> existing = new LinkedHashSet<>();
        for (String definition : indexDefinitions(schema, table)) {
            existing.add(normalizeIndexDefinition(definition, schema));
        }

        for (String definition : indexDefinitions("public", table)) {
            String normalized = normalizeIndexDefinition(definition, "public");
            if (existing.contains(normalized)) {
                continue;
            }
            String indexName = TenantIndexNames.unique("idx", schema, table + "_" + Integer.toHexString(
                    normalized.hashCode() & 0x7fffffff));
            String tenantDefinition = rewriteIndexDefinition(definition, schema, indexName);
            try {
                jdbcTemplate.execute(tenantDefinition);
                createdIndexes.add(indexName);
                existing.add(normalized);
            } catch (RuntimeException ex) {
                // Indice unico sobre dados que ja violam a restricao no tenant: reportar, nao abortar.
                warnings.add("Falha ao criar indice em %s: %s".formatted(table, ex.getMessage()));
            }
        }
    }

    private List<String> indexDefinitions(String schema, String table) {
        return jdbcTemplate.queryForList(
                "SELECT indexdef FROM pg_indexes WHERE schemaname = ? AND tablename = ?",
                String.class,
                schema,
                table);
    }

    /** Compara indices pelo que eles fazem (tabela, colunas, unicidade), ignorando o nome. */
    private String normalizeIndexDefinition(String definition, String schema) {
        int onIndex = definition.indexOf(" ON ");
        if (onIndex < 0) {
            return definition.toLowerCase(Locale.ROOT);
        }
        String head = definition.substring(0, onIndex).toLowerCase(Locale.ROOT);
        boolean unique = head.contains("unique index");
        String body = definition.substring(onIndex + 4)
                .replace("\"" + schema + "\".", "")
                .replace(schema + ".", "")
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
        return (unique ? "unique " : "") + body;
    }

    private String rewriteIndexDefinition(String definition, String schema, String indexName) {
        int onIndex = definition.indexOf(" ON ");
        String head = definition.substring(0, onIndex);
        String body = definition.substring(onIndex + 4);
        boolean unique = head.toLowerCase(Locale.ROOT).contains("unique index");
        String qualifiedBody = body.replaceFirst("^public\\.", "\"" + schema + "\".");
        return "CREATE " + (unique ? "UNIQUE " : "") + "INDEX IF NOT EXISTS \"" + indexName + "\" ON " + qualifiedBody;
    }

    // --- utilitarios -----------------------------------------------------------------------

    private List<String> publicAuditTables() {
        String suffix = TenantSchemaTableCatalog.AUDIT_TABLE_SUFFIX;
        return jdbcTemplate.queryForList(
                """
                SELECT tablename
                  FROM pg_tables
                 WHERE schemaname = 'public'
                   AND right(tablename, ?) = ?
                 ORDER BY tablename
                """,
                String.class,
                suffix.length(),
                suffix);
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, table));
        return Boolean.TRUE.equals(exists);
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }

    private record ColumnDefinition(String name, String type, boolean nullable, String defaultExpression) {}
}
