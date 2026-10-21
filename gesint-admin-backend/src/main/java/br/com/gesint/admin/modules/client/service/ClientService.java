package br.com.gesint.admin.modules.client.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.NestedExceptionUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.admin.core.base.dto.PageableResponseDto;
import br.com.gesint.admin.core.base.service.BaseService;
import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.client.dto.ClientRequestDto;
import br.com.gesint.admin.modules.client.dto.ClientResponseDto;
import br.com.gesint.admin.modules.client.dto.TenantDatabaseTestResultDto;
import br.com.gesint.admin.modules.client.dto.TenantSchemaSyncResultDto;
import br.com.gesint.admin.modules.client.entity.Client;
import br.com.gesint.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gesint.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gesint.admin.modules.client.entity.TenantRoutingModeEnum;
import br.com.gesint.admin.modules.client.exception.ClientException;
import br.com.gesint.admin.modules.client.mapper.ClientMapper;
import br.com.gesint.admin.modules.client.repository.ClientRepository;
import br.com.gesint.admin.modules.clientbranch.service.TenantBranchProvisioner;
import br.com.gesint.admin.modules.clientcontact.dto.ClientContactDto;
import br.com.gesint.admin.modules.clientcontact.entity.ClientContact;
import br.com.gesint.admin.modules.clientcontact.repository.ClientContactRepository;
import br.com.gesint.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gesint.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;

@Service
public class ClientService extends BaseService<Client, ClientRequestDto, ClientResponseDto> implements IClientService {

    private final ClientRepository repository;
    private final ClientMapper mapper;
    private final ClientContactRepository contactRepository;
    private final TenantDatabaseConnectionTester connectionTester;
    private final TenantSchemaProvisioner schemaProvisioner;
    private final TenantUserProvisioner tenantUserProvisioner;
    private final TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier;
    private final MobileLoginCodeGenerator mobileLoginCodeGenerator;
    private final ClientEnvironmentConfigRepository environmentConfigRepository;
    private final TenantSchemaStructureSynchronizer structureSynchronizer;
    private final TenantDefaultDataProvisioner defaultDataProvisioner;
    private final TenantBranchBackfiller branchBackfiller;
    private final TenantBranchProvisioner tenantBranchProvisioner;

    public ClientService(
            ClientRepository repository,
            ClientMapper mapper,
            ClientContactRepository contactRepository,
            TenantDatabaseConnectionTester connectionTester,
            TenantSchemaProvisioner schemaProvisioner,
            TenantUserProvisioner tenantUserProvisioner,
            TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier,
            MobileLoginCodeGenerator mobileLoginCodeGenerator,
            ClientEnvironmentConfigRepository environmentConfigRepository,
            TenantSchemaStructureSynchronizer structureSynchronizer,
            TenantDefaultDataProvisioner defaultDataProvisioner,
            TenantBranchBackfiller branchBackfiller,
            TenantBranchProvisioner tenantBranchProvisioner) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.contactRepository = contactRepository;
        this.connectionTester = connectionTester;
        this.schemaProvisioner = schemaProvisioner;
        this.tenantUserProvisioner = tenantUserProvisioner;
        this.tenantDatabaseDefaultsApplier = tenantDatabaseDefaultsApplier;
        this.mobileLoginCodeGenerator = mobileLoginCodeGenerator;
        this.environmentConfigRepository = environmentConfigRepository;
        this.structureSynchronizer = structureSynchronizer;
        this.defaultDataProvisioner = defaultDataProvisioner;
        this.branchBackfiller = branchBackfiller;
        this.tenantBranchProvisioner = tenantBranchProvisioner;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientResponseDto> findAll() {
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = status == StatusEnum.INACTIVE ? StatusEnum.INACTIVE : StatusEnum.ACTIVE;
        List<Client> clients = repository.findAllByStatusOrderByCreatedAtDesc(resolved);
        return toResponses(clients);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientResponseDto> findPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Client> result = repository.findAllByStatus(StatusEnum.ACTIVE, pageable);
        List<ClientResponseDto> content = toResponses(result.getContent());
        return PageableResponseDto.<ClientResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto create(ClientRequestDto request) {
        repository.findBySlugAndStatusNot(request.getSlug(), StatusEnum.DELETED).ifPresent(c -> {
            throw ClientException.slugAlreadyExists();
        });
        Client entity = mapper.toEntity(request);
        entity.setMobileLoginCode(generateUniqueMobileLoginCode());
        entity.setStatus(StatusEnum.ACTIVE);
        Client saved = repository.save(entity);
        replaceContacts(saved.getId(), request.getContacts());
        createDefaultEnvironmentConfig(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto update(UUID id, ClientRequestDto request) {
        repository
                .findBySlugAndStatusNot(request.getSlug(), StatusEnum.DELETED)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> {
                    throw ClientException.slugAlreadyExists();
                });
        Client entity = findEntity(id);
        mapper.updateEntity(entity, request);
        Client saved = repository.save(entity);
        replaceContacts(saved.getId(), request.getContacts());
        return toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Client findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ClientException::notFound);
    }

    @Override
    protected void updateEntity(Client entity, ClientRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private ClientResponseDto toResponse(Client entity) {
        List<ClientContact> contacts = contactRepository.findAllByClientIdAndStatusNotOrderBySortOrderAscCreatedAtAsc(
                entity.getId(), StatusEnum.DELETED);
        return mapper.toResponse(entity, contacts);
    }

    private List<ClientResponseDto> toResponses(List<Client> clients) {
        if (clients.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = clients.stream().map(Client::getId).toList();
        Map<UUID, List<ClientContact>> byClient = contactRepository
                .findAllByClientIdInAndStatusNotOrderBySortOrderAscCreatedAtAsc(ids, StatusEnum.DELETED)
                .stream()
                .collect(Collectors.groupingBy(ClientContact::getClientId));
        return clients.stream()
                .map(client -> mapper.toResponse(client, byClient.getOrDefault(client.getId(), List.of())))
                .toList();
    }

    private void replaceContacts(UUID clientId, List<ClientContactDto> contacts) {
        List<ClientContact> existing =
                contactRepository.findAllByClientIdAndStatusNotOrderBySortOrderAscCreatedAtAsc(
                        clientId, StatusEnum.DELETED);
        for (ClientContact contact : existing) {
            contact.setStatus(StatusEnum.DELETED);
        }
        if (!existing.isEmpty()) {
            contactRepository.saveAll(existing);
        }

        if (contacts == null || contacts.isEmpty()) {
            return;
        }

        List<ClientContact> created = new ArrayList<>();
        int sortOrder = 0;
        for (ClientContactDto dto : contacts) {
            if (dto == null || dto.getType() == null || dto.getValue() == null || dto.getValue().isBlank()) {
                continue;
            }
            created.add(ClientContact.builder()
                    .clientId(clientId)
                    .type(dto.getType())
                    .value(dto.getValue().trim())
                    .sortOrder(sortOrder++)
                    .status(StatusEnum.ACTIVE)
                    .build());
        }
        if (!created.isEmpty()) {
            contactRepository.saveAll(created);
        }
    }

    private void createDefaultEnvironmentConfig(Client client) {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .clientId(client.getId())
                .status(StatusEnum.ACTIVE)
                .routingMode(TenantRoutingModeEnum.SUBDOMAIN)
                .databaseStrategy(TenantDatabaseStrategyEnum.DEDICATED_SCHEMA)
                .provisioningStatus(TenantProvisioningStatusEnum.PENDING)
                .build();
        tenantDatabaseDefaultsApplier.apply(config, client.getSlug());
        environmentConfigRepository.save(config);
    }

    private String generateUniqueMobileLoginCode() {
        String mobileLoginCode;
        do {
            mobileLoginCode = mobileLoginCodeGenerator.generate();
        } while (repository.existsByMobileLoginCodeAndStatusNot(mobileLoginCode, StatusEnum.DELETED));
        return mobileLoginCode;
    }

    private ClientEnvironmentConfig findEnvironmentConfig(UUID clientId) {
        return environmentConfigRepository
                .findByClientIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientException::environmentConfigNotFound);
    }

    private ClientEnvironmentConfig prepareConfigForDatabaseOps(Client client) {
        ClientEnvironmentConfig config = findEnvironmentConfig(client.getId());
        tenantDatabaseDefaultsApplier.apply(config, client.getSlug());
        return environmentConfigRepository.save(config);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public TenantDatabaseTestResultDto testDatabaseConnection(UUID id) {
        Client client = findEntity(id);
        ClientEnvironmentConfig config = prepareConfigForDatabaseOps(client);
        long start = System.currentTimeMillis();
        try {
            connectionTester.testConnection(config);
            long latencyMs = System.currentTimeMillis() - start;
            return TenantDatabaseTestResultDto.builder()
                    .success(true)
                    .message("Conexão estabelecida com sucesso.")
                    .latencyMs(latencyMs)
                    .build();
        } catch (Exception ex) {
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            String message = root.getMessage() != null ? root.getMessage() : "Falha ao conectar no banco do tenant.";
            return TenantDatabaseTestResultDto.builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public TenantSchemaSyncResultDto syncSchema(UUID id) {
        Client client = findEntity(id);
        ClientEnvironmentConfig config = prepareConfigForDatabaseOps(client);
        if (config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            throw ClientException.databaseConfigIncomplete(
                    "Sincronizacao de estrutura so se aplica a tenants com schema dedicado.");
        }
        TenantSchemaSyncResultDto result = structureSynchronizer.sync(config.getDatabaseSchema());
        defaultDataProvisioner.seedDefaults(config.getDatabaseSchema());
        tenantBranchProvisioner.syncBranches(client.getId(), config);
        branchBackfiller.backfill(config.getDatabaseSchema());
        return result;
    }

    /**
     * Aplica migrations estruturais em todos os tenants ja provisionados. Falha de um tenant nao
     * interrompe os demais: o erro volta como aviso no resultado daquele schema.
     */
    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<TenantSchemaSyncResultDto> syncAllSchemas() {
        List<TenantSchemaSyncResultDto> results = new ArrayList<>();
        for (Client client : repository.findAll()) {
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
                TenantSchemaSyncResultDto result = structureSynchronizer.sync(config.getDatabaseSchema());
                defaultDataProvisioner.seedDefaults(config.getDatabaseSchema());
                tenantBranchProvisioner.syncBranches(client.getId(), config);
                branchBackfiller.backfill(config.getDatabaseSchema());
                results.add(result);
            } catch (Exception ex) {
                Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
                results.add(TenantSchemaSyncResultDto.builder()
                        .schema(config.getDatabaseSchema())
                        .createdTables(List.of())
                        .addedColumns(List.of())
                        .createdIndexes(List.of())
                        .warnings(List.of(root.getMessage() != null ? root.getMessage() : "Falha na sincronizacao."))
                        .build());
            }
        }
        return results;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto startProvisioning(UUID id) {
        Client client = findEntity(id);
        ClientEnvironmentConfig config = prepareConfigForDatabaseOps(client);
        if (config.getProvisioningStatus() == TenantProvisioningStatusEnum.PROVISIONING) {
            throw ClientException.provisioningInProgress();
        }

        config.setProvisioningStatus(TenantProvisioningStatusEnum.PROVISIONING);
        config.setProvisioningNotes("Provisionamento iniciado em " + OffsetDateTime.now());
        environmentConfigRepository.save(config);

        try {
            connectionTester.testConnection(config);
            schemaProvisioner.provisionDedicatedSchema(config);
            config.setProvisioningStatus(TenantProvisioningStatusEnum.READY);
            environmentConfigRepository.save(config);
            // As filiais vem antes dos usuarios: sem company no schema o tenant nasce sem matriz e
            // o seletor de filial fica vazio no primeiro login.
            tenantBranchProvisioner.syncBranches(client.getId(), config);
            branchBackfiller.backfill(config.getDatabaseSchema());
            tenantUserProvisioner.provisionPendingUsers(client.getId(), config);
            config.setProvisioningNotes("Tenant pronto — schema provisionado em " + OffsetDateTime.now());
        } catch (Exception ex) {
            config.setProvisioningStatus(TenantProvisioningStatusEnum.ERROR);
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            config.setProvisioningNotes(root.getMessage() != null ? root.getMessage() : "Erro no provisionamento.");
        }

        environmentConfigRepository.save(config);
        return toResponse(client);
    }
}
