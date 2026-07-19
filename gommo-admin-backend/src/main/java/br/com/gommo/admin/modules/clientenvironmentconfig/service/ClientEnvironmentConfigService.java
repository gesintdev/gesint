package br.com.gommo.admin.modules.clientenvironmentconfig.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.client.service.TenantDatabaseDefaultsApplier;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigRequestDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigResponseDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gommo.admin.modules.clientenvironmentconfig.exception.ClientEnvironmentConfigException;
import br.com.gommo.admin.modules.clientenvironmentconfig.mapper.ClientEnvironmentConfigMapper;
import br.com.gommo.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;

@Service
public class ClientEnvironmentConfigService
        extends BaseService<
                ClientEnvironmentConfig, ClientEnvironmentConfigRequestDto, ClientEnvironmentConfigResponseDto>
        implements IClientEnvironmentConfigService {

    private final ClientEnvironmentConfigRepository repository;
    private final ClientEnvironmentConfigMapper mapper;
    private final ClientRepository clientRepository;
    private final TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier;

    public ClientEnvironmentConfigService(
            ClientEnvironmentConfigRepository repository,
            ClientEnvironmentConfigMapper mapper,
            ClientRepository clientRepository,
            TenantDatabaseDefaultsApplier tenantDatabaseDefaultsApplier) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.clientRepository = clientRepository;
        this.tenantDatabaseDefaultsApplier = tenantDatabaseDefaultsApplier;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientEnvironmentConfigResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientEnvironmentConfigResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientEnvironmentConfigResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientEnvironmentConfigResponseDto create(ClientEnvironmentConfigRequestDto request) {
        assertClientExists(request.getClientId());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientEnvironmentConfigResponseDto update(UUID id, ClientEnvironmentConfigRequestDto request) {
        assertClientExists(request.getClientId());
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientEnvironmentConfigResponseDto findByClientId(UUID clientId) {
        return mapper.toResponse(findEntityByClientId(clientId));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientEnvironmentConfigResponseDto upsertByClient(UUID clientId, ClientEnvironmentConfigRequestDto request) {
        assertClientExists(clientId);
        request.setClientId(clientId);

        ClientEnvironmentConfig entity = repository
                .findByClientIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElse(null);

        if (entity == null) {
            entity = mapper.toEntity(request);
            entity.setStatus(StatusEnum.ACTIVE);
        } else {
            mapper.updateEntity(entity, request);
        }

        tenantDatabaseDefaultsApplier.apply(entity, resolveSlug(clientId));
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    protected ClientEnvironmentConfig findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ClientEnvironmentConfigException::notFound);
    }

    @Override
    protected void updateEntity(ClientEnvironmentConfig entity, ClientEnvironmentConfigRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private ClientEnvironmentConfig findEntityByClientId(UUID clientId) {
        return repository
                .findByClientIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientEnvironmentConfigException::notFound);
    }

    private String resolveSlug(UUID clientId) {
        return clientRepository
                .findByIdAndStatusNot(clientId, StatusEnum.DELETED)
                .map(client -> client.getSlug())
                .orElse(null);
    }

    private void assertClientExists(UUID clientId) {
        clientRepository
                .findByIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientEnvironmentConfigException::clientNotFound);
    }
}
