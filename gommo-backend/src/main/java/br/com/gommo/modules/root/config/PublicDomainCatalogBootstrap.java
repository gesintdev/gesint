package br.com.gommo.modules.root.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Garante o catalogo canonico do schema {@code public} apos as migrations do Flyway.
 *
 * <p>As migrations ja inserem permissoes, perfis, preferencias e listas padrao na primeira subida.
 * Este bootstrap complementa o ciclo de vida do ambiente ao sincronizar as permissoes dos perfis
 * Administrador quando novos modulos entram no sistema sem uma migration de backfill dedicada.
 */
@Component
public class PublicDomainCatalogBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PublicDomainCatalogBootstrap.class);

    private final JdbcTemplate jdbcTemplate;

    public PublicDomainCatalogBootstrap(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!adminProfileSyncFunctionExists()) {
            return;
        }
        try {
            jdbcTemplate.execute("SELECT public.gommo_sync_admin_profile_permissions()");
            log.info("Catalogo de permissoes dos perfis Administrador sincronizado no schema public.");
        } catch (DataAccessException ex) {
            log.warn(
                    "Nao foi possivel sincronizar os perfis Administrador no schema public: {}",
                    ex.getMessage());
        }
    }

    private boolean adminProfileSyncFunctionExists() {
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_proc p
                        JOIN pg_namespace n ON n.oid = p.pronamespace
                        WHERE n.nspname = 'public'
                          AND p.proname = 'gommo_sync_admin_profile_permissions'
                    )
                    """,
                    Boolean.class);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            return false;
        }
    }
}
