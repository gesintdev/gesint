package br.com.gommo.admin.modules.clientbranch.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.client.service.TenantSchemaProvisioner;
import br.com.gommo.admin.modules.clientbranch.entity.ClientBranch;
import br.com.gommo.admin.modules.clientbranch.repository.ClientBranchRepository;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

/**
 * Espelha a estrutura de estabelecimentos do cliente como linhas de {@code company} no schema do
 * tenant.
 *
 * A matriz vem dos Dados Basicos do cliente ({@code admin.client}) e as filiais vem de
 * {@code admin.client_branch}, penduradas nela por {@code parent_id}. Um cliente sem filial
 * cadastrada fica com uma unica company, a matriz, e o front nem mostra o seletor.
 *
 * O schema nasce com {@code company} vazia, e sem nenhuma company o tenant nao tem estabelecimento
 * para escopar. Este provisioner fecha essa lacuna e e idempotente, entao pode rodar a cada
 * provisionamento, sync de schema ou alteracao de filial.
 */
@Service
public class TenantBranchProvisioner {

    private static final Logger log = LoggerFactory.getLogger(TenantBranchProvisioner.class);

    private final JdbcTemplate jdbcTemplate;
    private final ClientBranchRepository branchRepository;
    private final ClientRepository clientRepository;

    public TenantBranchProvisioner(
            JdbcTemplate jdbcTemplate, ClientBranchRepository branchRepository, ClientRepository clientRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.branchRepository = branchRepository;
        this.clientRepository = clientRepository;
    }

    public void syncBranches(UUID clientId, ClientEnvironmentConfig config) {
        if (config == null
                || config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA
                || config.getProvisioningStatus() != TenantProvisioningStatusEnum.READY
                || !StringUtils.hasText(config.getDatabaseSchema())) {
            return;
        }
        String schema = TenantSchemaProvisioner.requireSafeSchema(config.getDatabaseSchema());
        if (!companyTableExists(schema)) {
            log.warn("Schema {} ainda nao tem tabela company: seed de filiais adiado.", schema);
            return;
        }

        Client client = clientRepository.findById(clientId).orElse(null);
        if (client == null) {
            return;
        }
        String headquartersCnpj = digits(client.getDocument());
        if (headquartersCnpj.isBlank()) {
            log.warn("Cliente {} sem CNPJ em Dados Basicos: matriz nao pode ser provisionada.", client.getSlug());
            return;
        }

        // A matriz precisa existir primeiro: e ela que as filiais referenciam em parent_id.
        UUID headquartersId = upsertHeadquarters(schema, client, headquartersCnpj);

        for (ClientBranch branch : branchRepository.findAllByClientIdAndStatusNotOrderBySortOrderAscLegalNameAsc(
                clientId, StatusEnum.DELETED)) {
            if (headquartersCnpj.equals(branch.getCnpj())) {
                // Cadastro feito quando a matriz ainda era digitada aqui: ela ja foi tratada acima.
                continue;
            }
            upsertBranch(schema, branch, headquartersId);
        }
    }

    /** Remove a company do tenant quando a filial e excluida no admin, preservando o historico. */
    public void deactivateCompany(ClientEnvironmentConfig config, UUID tenantCompanyId) {
        if (config == null || tenantCompanyId == null || !StringUtils.hasText(config.getDatabaseSchema())) {
            return;
        }
        String schema = TenantSchemaProvisioner.requireSafeSchema(config.getDatabaseSchema());
        if (!companyTableExists(schema)) {
            return;
        }
        jdbcTemplate.update(
                "UPDATE \"%s\".company SET status = 'INACTIVE', updated_at = now() WHERE id = ?".formatted(schema),
                tenantCompanyId);
    }

    /** A matriz espelha os Dados Basicos do cliente; o endereco de la e texto livre e nao e quebrado. */
    private UUID upsertHeadquarters(String schema, Client client, String cnpj) {
        CompanyData data = new CompanyData(
                null,
                true,
                0,
                limit(
                        client.getLegalName() != null && !client.getLegalName().isBlank()
                                ? client.getLegalName()
                                : client.getName(),
                        255),
                limit(client.getName(), 255),
                cnpj,
                null,
                null,
                limit(client.getContactEmail(), 200),
                firstPhone(client.getContactPhone()),
                null,
                null,
                null,
                null,
                null,
                null,
                null);
        UUID companyId = upsertCompany(schema, data, null);

        // Guarda o elo da matriz: e por ele que o escopo de filial dos sistemas contratados
        // consegue resolver a matriz, que nao tem linha em client_branch.
        if (!companyId.equals(client.getTenantCompanyId())) {
            client.setTenantCompanyId(companyId);
            clientRepository.save(client);
        }
        return companyId;
    }

    private void upsertBranch(String schema, ClientBranch branch, UUID headquartersId) {
        CompanyData data = new CompanyData(
                headquartersId,
                false,
                // A matriz ocupa a posicao 0 e precisa continuar aparecendo primeiro no seletor.
                Math.max(1, branch.getSortOrder()),
                branch.getLegalName(),
                branch.getTradeName(),
                branch.getCnpj(),
                branch.getStateRegistration(),
                branch.getMunicipalRegistration(),
                branch.getEmail(),
                branch.getPhone(),
                branch.getStreet(),
                branch.getNumber(),
                branch.getComplement(),
                branch.getDistrict(),
                branch.getCity(),
                branch.getStateCode(),
                branch.getZipCode());
        upsertCompany(schema, data, branch);
    }

    private UUID upsertCompany(String schema, CompanyData data, ClientBranch link) {
        UUID companyId = resolveCompanyId(schema, data.cnpj(), link);
        if (companyId == null) {
            companyId = insertCompany(schema, data);
        } else {
            updateCompany(schema, companyId, data);
        }

        if (link != null && (!companyId.equals(link.getTenantCompanyId()) || link.getProvisionedAt() == null)) {
            link.setTenantCompanyId(companyId);
            link.setProvisionedAt(OffsetDateTime.now());
            branchRepository.save(link);
        }
        return companyId;
    }

    /** Reconhece a company pelo vinculo ja gravado ou, em tenant preexistente, pelo CNPJ. */
    private UUID resolveCompanyId(String schema, String cnpj, ClientBranch link) {
        if (link != null && link.getTenantCompanyId() != null) {
            List<UUID> found = jdbcTemplate.queryForList(
                    "SELECT id FROM \"%s\".company WHERE id = ?".formatted(schema),
                    UUID.class,
                    link.getTenantCompanyId());
            if (!found.isEmpty()) {
                return found.getFirst();
            }
        }
        List<UUID> byCnpj = jdbcTemplate.queryForList(
                "SELECT id FROM \"%s\".company WHERE cnpj = ? AND status <> 'DELETED' ORDER BY created_at LIMIT 1"
                        .formatted(schema),
                UUID.class,
                cnpj);
        return byCnpj.isEmpty() ? null : byCnpj.getFirst();
    }

    private String digits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    /**
     * O contato do cliente e texto livre e costuma trazer varios numeros ("(87) 1111 / (87) 2222"),
     * enquanto {@code company.phone} guarda um so. Truncar geraria um numero partido pela metade,
     * entao fica o primeiro.
     */
    private String firstPhone(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String first = value.split("[/;,]", 2)[0].trim();
        return limit(first.isBlank() ? value.trim() : first, 20);
    }

    private String limit(String value, int max) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private record CompanyData(
            UUID parentId,
            boolean headquarters,
            int sortOrder,
            String legalName,
            String tradeName,
            String cnpj,
            String stateRegistration,
            String municipalRegistration,
            String email,
            String phone,
            String street,
            String number,
            String complement,
            String district,
            String city,
            String stateCode,
            String zipCode) {}

    private UUID insertCompany(String schema, CompanyData data) {
        UUID companyId = UUID.randomUUID();
        Integer nextCode = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(code), 0) + 1 FROM \"%s\".company".formatted(schema), Integer.class);
        jdbcTemplate.update(
                """
                INSERT INTO "%s".company (
                    id, status, code, parent_id, is_headquarters, sort_order,
                    legal_name, trade_name, cnpj, state_registration, municipal_registration,
                    email, phone, street, number, complement, district, city, state_code, zip_code,
                    created_at, updated_at
                ) VALUES (?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())
                """
                        .formatted(schema),
                companyId,
                nextCode == null ? 1 : nextCode,
                data.parentId(),
                data.headquarters(),
                data.sortOrder(),
                data.legalName(),
                data.tradeName(),
                data.cnpj(),
                data.stateRegistration(),
                data.municipalRegistration(),
                data.email(),
                data.phone(),
                data.street(),
                data.number(),
                data.complement(),
                data.district(),
                data.city(),
                data.stateCode(),
                data.zipCode());
        return companyId;
    }

    private void updateCompany(String schema, UUID companyId, CompanyData data) {
        jdbcTemplate.update(
                """
                UPDATE "%s".company SET
                    status = 'ACTIVE', parent_id = ?, is_headquarters = ?, sort_order = ?,
                    legal_name = ?, trade_name = ?, cnpj = ?, state_registration = ?,
                    municipal_registration = ?, email = ?, phone = ?, street = ?, number = ?,
                    complement = ?, district = ?, city = ?, state_code = ?, zip_code = ?,
                    updated_at = now()
                WHERE id = ?
                """
                        .formatted(schema),
                data.parentId(),
                data.headquarters(),
                data.sortOrder(),
                data.legalName(),
                data.tradeName(),
                data.cnpj(),
                data.stateRegistration(),
                data.municipalRegistration(),
                data.email(),
                data.phone(),
                data.street(),
                data.number(),
                data.complement(),
                data.district(),
                data.city(),
                data.stateCode(),
                data.zipCode(),
                companyId);
    }

    private boolean companyTableExists(String schema) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = 'company'",
                Integer.class,
                schema);
        return count != null && count > 0;
    }
}
