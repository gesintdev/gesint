package br.com.gommo.admin.modules.client.service;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.dto.TenantDatabaseTestResultDto;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;
import br.com.gommo.admin.modules.client.mapper.ClientMapper;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ClientService extends BaseService<Client, ClientRequestDto, ClientResponseDto>
        implements IClientService {

    private final ClientRepository repository;
    private final ClientMapper mapper;
    private final TenantDatabaseConnectionTester connectionTester;
    private final TenantSchemaProvisioner schemaProvisioner;

    public ClientService(
            ClientRepository repository,
            ClientMapper mapper,
            TenantDatabaseConnectionTester connectionTester,
            TenantSchemaProvisioner schemaProvisioner) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.connectionTester = connectionTester;
        this.schemaProvisioner = schemaProvisioner;
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
        repository.findBySlugAndStatusNot(request.getSlug(), StatusEnum.DELETED)
                .ifPresent(c -> {
                    throw ClientException.slugAlreadyExists();
                });
        Client entity = mapper.toEntity(request);
        applyTenantDefaults(entity, request.getSlug());
        entity.setStatus(StatusEnum.ACTIVE);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto update(UUID id, ClientRequestDto request) {
        repository.findBySlugAndStatusNot(request.getSlug(), StatusEnum.DELETED)
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
        applyTenantDefaults(entity, request.getSlug());
    }

    private void applyTenantDefaults(Client entity, String slug) {
        if (!StringUtils.hasText(entity.getSubdomain()) && StringUtils.hasText(slug)) {
            entity.setSubdomain(slug.trim());
        }
        if (entity.getDatabaseStrategy() == TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            if (!StringUtils.hasText(entity.getDatabaseSchema()) || "public".equalsIgnoreCase(entity.getDatabaseSchema())) {
                entity.setDatabaseSchema(TenantSchemaProvisioner.defaultSchemaForSlug(slug));
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public TenantDatabaseTestResultDto testDatabaseConnection(UUID id) {
        Client client = findEntity(id);
        long start = System.currentTimeMillis();
        try {
            connectionTester.testConnection(client);
            long latencyMs = System.currentTimeMillis() - start;
            return TenantDatabaseTestResultDto.builder()
                    .success(true)
                    .message("Conexão estabelecida com sucesso.")
                    .latencyMs(latencyMs)
                    .build();
        } catch (Exception ex) {
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            String message = root.getMessage() != null ? root.getMessage() : "Falha ao conectar no banco do tenant.";
            return TenantDatabaseTestResultDto.builder().success(false).message(message).build();
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientResponseDto startProvisioning(UUID id) {
        Client client = findEntity(id);
        if (client.getProvisioningStatus() == TenantProvisioningStatusEnum.PROVISIONING) {
            throw ClientException.provisioningInProgress();
        }

        client.setProvisioningStatus(TenantProvisioningStatusEnum.PROVISIONING);
        client.setProvisioningNotes("Provisionamento iniciado em " + OffsetDateTime.now());
        repository.save(client);

        try {
            connectionTester.testConnection(client);
            applyTenantDefaults(client, client.getSlug());
            schemaProvisioner.provisionDedicatedSchema(client);
            client.setProvisioningStatus(TenantProvisioningStatusEnum.READY);
            client.setProvisioningNotes("Tenant pronto — schema provisionado em " + OffsetDateTime.now());
        } catch (Exception ex) {
            client.setProvisioningStatus(TenantProvisioningStatusEnum.ERROR);
            Throwable root = NestedExceptionUtils.getMostSpecificCause(ex);
            client.setProvisioningNotes(root.getMessage() != null ? root.getMessage() : "Erro no provisionamento.");
        }

        return mapper.toResponse(repository.save(client));
    }
}
