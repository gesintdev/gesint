package br.com.gommo.admin.modules.client.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.core.NestedExceptionUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.dto.TenantDatabaseTestResultDto;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;
import br.com.gommo.admin.modules.client.mapper.ClientMapper;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gommo.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;

@Service
public class ClientService extends BaseService<Client, ClientRequestDto, ClientResponseDto> implements IClientService {

    private final ClientRepository repository;
    private final ClientMapper mapper;
    private final TenantDatabaseConnectionTester connectionTester;
    private final TenantSchemaProvisioner schemaProvisioner;
    private final TenantUserProvisioner tenantUserProvisioner;
    private final TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier;
    private final MobileLoginCodeGenerator mobileLoginCodeGenerator;
    private final ClientEnvironmentConfigRepository environmentConfigRepository;

    public ClientService(
            ClientRepository repository,
            ClientMapper mapper,
            TenantDatabaseConnectionTester connectionTester,
            TenantSchemaProvisioner schemaProvisioner,
            TenantUserProvisioner tenantUserProvisioner,
            TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier,
            MobileLoginCodeGenerator mobileLoginCodeGenerator,
            ClientEnvironmentConfigRepository environmentConfigRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.connectionTester = connectionTester;
        this.schemaProvisioner = schemaProvisioner;
        this.tenantUserProvisioner = tenantUserProvisioner;
        this.tenantDatabaseDefaultsApplier = tenantDatabaseDefaultsApplier;
        this.mobileLoginCodeGenerator = mobileLoginCodeGenerator;
        this.environmentConfigRepository = environmentConfigRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
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

        createDefaultEnvironmentConfig(saved);

        return mapper.toResponse(saved);
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
        return super.update(id, request);
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
            tenantUserProvisioner.provisionPendingUsers(client.getId(), config);
            config.setProvisioningNotes("Tenant pronto — schema provisionado em " + OffsetDateTime.now());
        } catch (Exception ex) {
            config.setProvisioningStatus(TenantProvisioningStatusEnum.ERROR);
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            config.setProvisioningNotes(root.getMessage() != null ? root.getMessage() : "Erro no provisionamento.");
        }

        environmentConfigRepository.save(config);
        return mapper.toResponse(client);
    }
}
