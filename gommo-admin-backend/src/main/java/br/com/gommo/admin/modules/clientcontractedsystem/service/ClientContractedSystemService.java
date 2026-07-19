package br.com.gommo.admin.modules.clientcontractedsystem.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemRequestDto;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemResponseDto;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.ClientContractedSystem;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.OperationalStatusEnum;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.SessionPolicyEnum;
import br.com.gommo.admin.modules.clientcontractedsystem.exception.ClientContractedSystemException;
import br.com.gommo.admin.modules.clientcontractedsystem.mapper.ClientContractedSystemMapper;
import br.com.gommo.admin.modules.clientcontractedsystem.repository.ClientContractedSystemRepository;
import br.com.gommo.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;
import br.com.gommo.admin.modules.platformoutbox.service.PlatformOutboxPublisher;
import br.com.gommo.admin.modules.productsystem.entity.ProductSystem;
import br.com.gommo.admin.modules.productsystem.exception.ProductSystemException;
import br.com.gommo.admin.modules.productsystem.repository.ProductSystemRepository;

@Service
public class ClientContractedSystemService
        extends BaseService<ClientContractedSystem, ClientContractedSystemRequestDto, ClientContractedSystemResponseDto>
        implements IClientContractedSystemService {

    private final ClientContractedSystemRepository repository;
    private final ClientContractedSystemMapper mapper;
    private final ClientRepository clientRepository;
    private final ClientEnvironmentConfigRepository environmentConfigRepository;
    private final ProductSystemRepository productSystemRepository;
    private final PlatformOutboxPublisher outboxPublisher;

    public ClientContractedSystemService(
            ClientContractedSystemRepository repository,
            ClientContractedSystemMapper mapper,
            ClientRepository clientRepository,
            ClientEnvironmentConfigRepository environmentConfigRepository,
            ProductSystemRepository productSystemRepository,
            PlatformOutboxPublisher outboxPublisher) {
        super(
                repository,
                entity -> mapper.toResponse(
                        entity,
                        productSystemRepository
                                .findById(entity.getProductSystemId())
                                .orElse(null)),
                request -> {
                    throw new UnsupportedOperationException("Use create override");
                });
        this.repository = repository;
        this.mapper = mapper;
        this.clientRepository = clientRepository;
        this.environmentConfigRepository = environmentConfigRepository;
        this.productSystemRepository = productSystemRepository;
        this.outboxPublisher = outboxPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientContractedSystemResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientContractedSystemResponseDto> findAllByClientId(UUID clientId) {
        return repository.findAllByClientIdAndStatusNotOrderByCreatedAtDesc(clientId, StatusEnum.DELETED).stream()
                .map(entity -> mapper.toResponse(entity, resolveProduct(entity.getProductSystemId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientContractedSystemResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientContractedSystemResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientContractedSystemResponseDto create(ClientContractedSystemRequestDto request) {
        Client client = assertClientExists(request.getClientId());
        ProductSystem productSystem = resolveProduct(request.getProductSystemId());
        assertUniqueContract(request.getClientId(), productSystem.getId(), null);
        assertLifecycle(request);
        ClientContractedSystem entity = mapper.toEntity(request, productSystem);
        entity.setStatus(StatusEnum.ACTIVE);
        if (entity.getSessionPolicy() == null) {
            entity.setSessionPolicy(SessionPolicyEnum.KEEP_UNTIL_EXPIRY);
        }
        normalizeLifecycleForPersistence(entity);
        ClientContractedSystem saved = repository.save(entity);
        publishOutbox(saved, client, productSystem.getKey());
        return mapper.toResponse(saved, productSystem);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientContractedSystemResponseDto update(UUID id, ClientContractedSystemRequestDto request) {
        Client client = assertClientExists(request.getClientId());
        ProductSystem productSystem = resolveProduct(request.getProductSystemId());
        assertUniqueContract(request.getClientId(), productSystem.getId(), id);
        assertLifecycle(request);
        ClientContractedSystem entity = findEntity(id);
        mapper.updateEntity(entity, request, productSystem);
        normalizeLifecycleForPersistence(entity);
        ClientContractedSystem saved = repository.save(entity);
        publishOutbox(saved, client, productSystem.getKey());
        return mapper.toResponse(saved, productSystem);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        ClientContractedSystem entity = findEntity(id);
        Client client = assertClientExists(entity.getClientId());
        ProductSystem product = resolveProduct(entity.getProductSystemId());
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
        publishOutbox(entity, client, product.getKey());
    }

    private void publishOutbox(ClientContractedSystem entity, Client client, String productKey) {
        String databaseSchema = environmentConfigRepository
                .findByClientIdAndStatusNot(client.getId(), StatusEnum.DELETED)
                .map(config -> config.getDatabaseSchema())
                .filter(schema -> schema != null && !schema.isBlank())
                .orElse(null);
        outboxPublisher.publishContractedSystemChanged(entity, client.getSlug(), productKey, databaseSchema);
    }

    @Override
    protected ClientContractedSystem findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ClientContractedSystemException::notFound);
    }

    @Override
    protected void updateEntity(ClientContractedSystem entity, ClientContractedSystemRequestDto request) {
        mapper.updateEntity(entity, request, resolveProduct(request.getProductSystemId()));
    }

    private ProductSystem resolveProduct(UUID productSystemId) {
        return productSystemRepository
                .findByIdAndStatusNot(productSystemId, StatusEnum.DELETED)
                .orElseThrow(ProductSystemException::notFound);
    }

    private Client assertClientExists(UUID clientId) {
        return clientRepository
                .findByIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientContractedSystemException::clientNotFound);
    }

    private void assertUniqueContract(UUID clientId, UUID productSystemId, UUID currentId) {
        boolean exists = currentId == null
                ? repository.existsByClientIdAndProductSystemIdAndStatusNot(
                        clientId, productSystemId, StatusEnum.DELETED)
                : repository.existsByClientIdAndProductSystemIdAndStatusNotAndIdNot(
                        clientId, productSystemId, StatusEnum.DELETED, currentId);
        if (exists) {
            throw ClientContractedSystemException.alreadyContracted();
        }
    }

    private void assertLifecycle(ClientContractedSystemRequestDto request) {
        if ("SCHEDULED".equalsIgnoreCase(request.getSessionPolicy()) && request.getDeactivateAt() == null) {
            throw ClientContractedSystemException.deactivateAtRequired();
        }
    }

    /**
     * Ao reativar (ACTIVE), limpa resíduos de desativação que bloqueiam o login no Client:
     * {@code deactivate_at} no passado e {@code FORCE_LOGOUT} deixado do ciclo anterior.
     * O Client considera efetivo só se {@code operational_status = ACTIVE} e
     * {@code deactivate_at IS NULL OR deactivate_at > now()}.
     */
    private void normalizeLifecycleForPersistence(ClientContractedSystem entity) {
        if (entity.getOperationalStatus() != OperationalStatusEnum.ACTIVE) {
            return;
        }

        if (entity.getSessionPolicy() == SessionPolicyEnum.FORCE_LOGOUT) {
            entity.setSessionPolicy(SessionPolicyEnum.KEEP_UNTIL_EXPIRY);
        }

        OffsetDateTime deactivateAt = entity.getDeactivateAt();
        boolean scheduledFuture =
                entity.getSessionPolicy() == SessionPolicyEnum.SCHEDULED
                        && deactivateAt != null
                        && deactivateAt.isAfter(OffsetDateTime.now());
        if (!scheduledFuture) {
            entity.setDeactivateAt(null);
            if (entity.getSessionPolicy() == SessionPolicyEnum.SCHEDULED) {
                entity.setSessionPolicy(SessionPolicyEnum.KEEP_UNTIL_EXPIRY);
            }
        }
    }
}
