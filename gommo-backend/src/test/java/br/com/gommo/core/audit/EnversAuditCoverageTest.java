package br.com.gommo.core.audit;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.type.filter.AnnotationTypeFilter;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

/**
 * Toda entidade nasce com historico Envers. Esquecer {@code @Audited} faz o historico sumir em
 * silencio; esquecer a tabela {@code _aud} derruba o boot ({@code ddl-auto: validate}) ou toda
 * escrita no tenant. Este teste transforma os dois esquecimentos em build quebrado.
 */
class EnversAuditCoverageTest {

    private static final String ENTITY_BASE_PACKAGE = "br.com.gommo.modules";

    /** Excecoes explicitas: entidade tecnica, catalogo somente leitura ou derivado. */
    private static final Map<String, String> NOT_AUDITED = Map.of(
            "SearchDocument", "indice de busca derivado, regravado a partir das entidades de origem",
            "StorageObject", "metadado de arquivo binario gerenciado pelo modulo de storage",
            "StorageObjectLink", "vinculo tecnico de arquivo gerenciado pelo modulo de storage",
            "SystemNotification", "notificacao gerada pelo sistema, sem cadastro pelo usuario",
            "City", "catalogo compartilhado em public, somente leitura",
            "State", "catalogo compartilhado em public, somente leitura",
            "CboOccupation", "catalogo compartilhado em public, somente leitura",
            "Permission", "catalogo de authorities seedado por migration",
            "RefreshToken", "sessao tecnica de autenticacao",
            "RefreshTokenBlacklist", "sessao tecnica de autenticacao");

    private static final Pattern AUDIT_SYNC_CALL =
            Pattern.compile("gommo_audit_sync_table\\(\\s*'([a-z0-9_]+)'\\s*\\)");

    @Test
    @DisplayName("toda entidade e @Audited ou esta na lista explicita de excecoes")
    void everyEntityIsAuditedOrExplicitlyExcluded() {
        List<String> missing = new ArrayList<>();
        for (Class<?> entity : entities()) {
            if (!entity.isAnnotationPresent(Audited.class) && !NOT_AUDITED.containsKey(entity.getSimpleName())) {
                missing.add(entity.getName());
            }
        }

        assertThat(missing)
                .as("Entidades sem @Audited: adicione a anotacao e a migration com "
                        + "public.gommo_audit_sync_table('<tabela>'), ou justifique em NOT_AUDITED")
                .isEmpty();
    }

    @Test
    @DisplayName("excecoes de auditoria apontam para entidades existentes e nao auditadas")
    void exclusionsStayAccurate() {
        Set<String> notAuditedEntities = new TreeSet<>();
        for (Class<?> entity : entities()) {
            if (!entity.isAnnotationPresent(Audited.class)) {
                notAuditedEntities.add(entity.getSimpleName());
            }
        }

        assertThat(notAuditedEntities).isEqualTo(new TreeSet<>(NOT_AUDITED.keySet()));
    }

    @Test
    @DisplayName("toda tabela auditada tem <tabela>_aud criada por migration")
    void everyAuditedTableHasAuditMigration() throws IOException {
        Set<String> synced = auditTablesFromMigrations();

        Set<String> missing = new TreeSet<>(auditedTables());
        missing.removeAll(synced);

        assertThat(missing)
                .as("Tabelas auditadas sem SELECT public.gommo_audit_sync_table('<tabela>') em db/migration")
                .isEmpty();
    }

    @Test
    @DisplayName("o scan encontra as entidades, senao o teste seria vacuo")
    void scanFindsEntities() {
        assertThat(entities()).hasSizeGreaterThan(60);
        assertThat(auditedTables()).contains("collaborator", "role", "role_permission");
    }

    private Set<String> auditedTables() {
        Set<String> tables = new TreeSet<>();
        for (Class<?> entity : entities()) {
            if (!entity.isAnnotationPresent(Audited.class)) {
                continue;
            }
            Table table = entity.getAnnotation(Table.class);
            assertThat(table)
                    .as("Entidade auditada sem @Table(name): %s", entity.getName())
                    .isNotNull();
            tables.add(table.name());
            tables.addAll(auditedJoinTables(entity));
        }
        return tables;
    }

    /** {@code @ManyToMany} auditado grava o vinculo em {@code <tabela_de_juncao>_aud}. */
    private static List<String> auditedJoinTables(Class<?> entity) {
        List<String> joinTables = new ArrayList<>();
        for (Field field : entity.getDeclaredFields()) {
            JoinTable joinTable = field.getAnnotation(JoinTable.class);
            if (field.isAnnotationPresent(ManyToMany.class)
                    && joinTable != null
                    && !field.isAnnotationPresent(NotAudited.class)) {
                joinTables.add(joinTable.name());
            }
        }
        return joinTables;
    }

    private static Set<String> auditTablesFromMigrations() throws IOException {
        Set<String> tables = new TreeSet<>();
        Resource[] migrations =
                new PathMatchingResourcePatternResolver().getResources("classpath*:db/migration/*.sql");
        assertThat(migrations).isNotEmpty();
        for (Resource migration : migrations) {
            try (InputStream in = migration.getInputStream()) {
                Matcher matcher = AUDIT_SYNC_CALL.matcher(new String(in.readAllBytes(), StandardCharsets.UTF_8));
                while (matcher.find()) {
                    tables.add(matcher.group(1));
                }
            }
        }
        return tables;
    }

    private static List<Class<?>> entities() {
        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));

        List<Class<?>> entities = new ArrayList<>();
        for (BeanDefinition definition : scanner.findCandidateComponents(ENTITY_BASE_PACKAGE)) {
            try {
                entities.add(Class.forName(definition.getBeanClassName()));
            } catch (ClassNotFoundException ex) {
                throw new IllegalStateException(ex);
            }
        }
        return entities;
    }
}
