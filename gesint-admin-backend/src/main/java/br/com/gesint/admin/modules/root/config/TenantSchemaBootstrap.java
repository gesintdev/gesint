package br.com.gesint.admin.modules.root.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.stereotype.Component;

import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.client.entity.Client;
import br.com.gesint.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gesint.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gesint.admin.modules.client.repository.ClientRepository;
import br.com.gesint.admin.modules.client.service.TenantBranchBackfiller;
import br.com.gesint.admin.modules.client.service.TenantDefaultDataProvisioner;
import br.com.gesint.admin.modules.client.service.TenantSchemaStructureSynchronizer;
import br.com.gesint.admin.modules.clientbranch.service.TenantBranchProvisioner;
import br.com.gesint.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gesint.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;

/**
 * Aplica no start as migrations estruturais nos schemas de tenant ja provisionados.
 *
 * O Flyway migra apenas o schema {@code public}; os schemas de tenant sao clones estruturais e
 * ficam para tras a cada coluna nova. Sem um gatilho automatico, toda coluna adicionada derruba
 * todos os tenants existentes ate alguem chamar o endpoint de sincronizacao na mao — foi o que
 * aconteceu com {@code company.is_headquarters}, que quebrou o login dos tenants antigos.
 *
 * A operacao e aditiva e idempotente: cria tabelas e colunas ausentes e nao remove nada. Falha de
 * um tenant e registrada e nao interrompe o start nem os demais tenants.
 */
@Component
public class TenantSchemaBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantSchemaBootstrap.class);

    private final ClientRepository clientRepository;
    private final ClientEnvironmentConfigRepository environmentConfigRepository;
    private final TenantSchemaStructureSynchronizer structureSynchronizer;
    private final TenantDefaultDataProvisioner defaultDataProvisioner;
    private final TenantBranchProvisioner tenantBranchProvisioner;
    private final TenantBranchBackfiller branchBackfiller;
    private final boolean enabled;

    public TenantSchemaBootstrap(
            ClientRepository clientRepository,
            ClientEnvironmentConfigRepository environmentConfigRepository,
            TenantSchemaStructureSynchronizer structureSynchronizer,
            TenantDefaultDataProvisioner defaultDataProvisioner,
            TenantBranchProvisioner tenantBranchProvisioner,
            TenantBranchBackfiller branchBackfiller,
            @Value("${gesint-admin.tenant-schema.sync-on-startup:true}") boolean enabled) {
        this.clientRepository = clientRepository;
        this.environmentConfigRepository = environmentConfigRepository;
        this.structureSynchronizer = structureSynchronizer;
        this.defaultDataProvisioner = defaultDataProvisioner;
        this.tenantBranchProvisioner = tenantBranchProvisioner;
        this.branchBackfiller = branchBackfiller;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("Sincronizacao de schemas de tenant no start desabilitada por configuracao.");
            return;
        }

        int synced = 0;
        int failed = 0;
        for (Client client : clientRepository.findAll()) {
            if (client.getStatus() == StatusEnum.DELETED) {
                continue;
            }
            ClientEnvironmentConfig config = environmentConfigRepository
                    .findByClientIdAndStatusNot(client.getId(), StatusEnum.DELETED)
                    .orElse(null);
            if (config == null
                    || config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA
                    || config.getProvisioningStatus() != TenantProvisioningStatusEnum.READY) {
                continue;
            }
            try {
                structureSynchronizer.sync(config.getDatabaseSchema());
                defaultDataProvisioner.seedDefaults(config.getDatabaseSchema());
                tenantBranchProvisioner.syncBranches(client.getId(), config);
                branchBackfiller.backfill(config.getDatabaseSchema());
                synced++;
            } catch (Exception ex) {
                failed++;
                Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
                log.error(
                        "Falha ao sincronizar o schema {} do cliente {}: {}",
                        config.getDatabaseSchema(),
                        client.getSlug(),
                        root.getMessage(),
                        ex);
            }
        }

        if (synced > 0 || failed > 0) {
            log.info("Schemas de tenant sincronizados no start: {} ok, {} com falha.", synced, failed);
        }
    }
}
