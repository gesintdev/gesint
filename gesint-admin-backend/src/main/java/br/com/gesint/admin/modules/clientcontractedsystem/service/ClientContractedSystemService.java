package br.com.gesint.admin.modules.clientcontractedsystem.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.admin.core.base.dto.PageableResponseDto;
import br.com.gesint.admin.core.base.service.BaseService;
import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.client.entity.Client;
import br.com.gesint.admin.modules.client.repository.ClientRepository;
import br.com.gesint.admin.modules.clientcontractedsystem.dto.ClientContractedSystemRequestDto;
import br.com.gesint.admin.modules.clientcontractedsystem.dto.ClientContractedSystemResponseDto;
import br.com.gesint.admin.modules.clientcontractedsystem.entity.BranchModeEnum;
import br.com.gesint.admin.modules.clientcontractedsystem.entity.ClientContractedSystem;
import br.com.gesint.admin.modules.clientcontractedsystem.entity.OperationalStatusEnum;
import br.com.gesint.admin.modules.clientcontractedsystem.entity.SessionPolicyEnum;
import br.com.gesint.admin.modules.clientcontractedsystem.exception.ClientContractedSystemException;
import br.com.gesint.admin.modules.clientcontractedsystem.mapper.ClientContractedSystemMapper;
import br.com.gesint.admin.modules.clientcontractedsystem.repository.ClientContractedSystemRepository;
import br.com.gesint.admin.modules.clientcontractedsystem.repository.ContractedSystemBranchScopeRepository;
import br.com.gesint.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;
import br.com.gesint.admin.modules.platformoutbox.service.PlatformOutboxPublisher;
import br.com.gesint.admin.modules.productsystem.entity.ProductSystem;
import br.com.gesint.admin.modules.productsystem.exception.ProductSystemException;
import br.com.gesint.admin.modules.productsystem.repository.ProductSystemRepository;
import br.com.gesint.admin.modules.productsystem.support.CtbSystemAvailability;

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
    private final ContractedSystemBranchScopeRepository branchScopeRepository;
    private final CtbSystemAvailability ctbSystemAvailability;

    public ClientContractedSystemService(
            ClientContractedSystemRepository repository,
            ClientContractedSystemMapper mapper,
            ClientRepository clientRepository,
            ClientEnvironmentConfigRepository environmentConfigRepository,
            ProductSystemRepository productSystemRepository,
            PlatformOutboxPublisher outboxPublisher,
            ContractedSystemBranchScopeRepository branchScopeRepository,
            CtbSystemAvailability ctbSystemAvailability) {
        super(
                repository,
                entity -> mapper.toResponse(
                        entity,
                        productSystemRepository
                                .findById(entity.getProductSystemId())
                                .orElse(null),
                        branchScopeRepository.findBranchIds(entity.getId())),
                request -> {
                    throw new UnsupportedOperationException("Use create override");
                });
        this.repository = repository;
        this.mapper = mapper;
        this.clientRepository = clientRepository;
        this.environmentConfigRepository = environmentConfigRepository;
        this.productSystemRepository = productSystemRepository;
        this.outboxPublisher = outboxPublisher;
        this.branchScopeRepository = branchScopeRepository;
        this.ctbSystemAvailability = ctbSystemAvailability;
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
                .map(entity -> mapper.toResponse(
                        entity,
                        resolveProduct(entity.getProductSystemId()),
                        branchScopeRepository.findBranchIds(entity.getId())))
                .filter(dto -> ctbSystemAvailability.isCommercialProductKey(dto.getProductSystemKey()))
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
        List<UUID> scope = persistBranchScope(saved, request);
        publishOutbox(saved, client, productSystem.getKey(), scope);
        return mapper.toResponse(saved, productSystem, scope);
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
        List<UUID> scope = persistBranchScope(saved, request);
        publishOutbox(saved, client, productSystem.getKey(), scope);
        return mapper.toResponse(saved, productSystem, scope);
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
        branchScopeRepository.clear(entity.getId());
        publishOutbox(entity, client, product.getKey(), List.of());
    }

    /**
     * Em {@code ALL} nao ha linhas de associacao, e por isso filial cadastrada depois herda o
     * contrato sem intervencao. Em {@code SELECTED} sem nenhuma filial marcada o contrato nao
     * valeria em lugar nenhum, entao a matriz entra como minimo.
     */
    private List<UUID> persistBranchScope(ClientContractedSystem entity, ClientContractedSystemRequestDto request) {
        if (entity.getBranchMode() != BranchModeEnum.SELECTED) {
            branchScopeRepository.clear(entity.getId());
            return List.of();
        }

        List<UUID> branchIds = request.getClientBranchIds() != null ? request.getClientBranchIds() : List.of();
        boolean includeHeadquarters =
                Boolean.TRUE.equals(request.getIncludeHeadquarters()) || branchIds.isEmpty();
        branchScopeRepository.replace(entity.getId(), includeHeadquarters, branchIds);
        return branchScopeRepository.findBranchIds(entity.getId());
    }

    private void publishOutbox(
            ClientContractedSystem entity, Client client, String productKey, List<UUID> scopedBranchIds) {
        String databaseSchema = environmentConfigRepository
                .findByClientIdAndStatusNot(client.getId(), StatusEnum.DELETED)
                .map(config -> config.getDatabaseSchema())
                .filter(schema -> schema != null && !schema.isBlank())
                .orElse(null);
        outboxPublisher.publishContractedSystemChanged(
                entity, client.getSlug(), productKey, databaseSchema, scopedBranchIds);
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
        ProductSystem product = productSystemRepository
                .findByIdAndStatusNot(productSystemId, StatusEnum.DELETED)
                .orElseThrow(ProductSystemException::notFound);
        if (!ctbSystemAvailability.isCommercialProductKey(product.getKey())) {
            throw ClientContractedSystemException.productUnavailable();
        }
        return product;
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
