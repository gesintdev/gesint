package br.com.gommo.admin.modules.clientsubscription.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionRequestDto;
import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionResponseDto;
import br.com.gommo.admin.modules.clientsubscription.entity.ClientSubscription;
import br.com.gommo.admin.modules.clientsubscription.exception.ClientSubscriptionException;
import br.com.gommo.admin.modules.clientsubscription.mapper.ClientSubscriptionMapper;
import br.com.gommo.admin.modules.clientsubscription.repository.ClientSubscriptionRepository;

@Service
public class ClientSubscriptionService
        extends BaseService<ClientSubscription, ClientSubscriptionRequestDto, ClientSubscriptionResponseDto>
        implements IClientSubscriptionService {

    private final ClientSubscriptionRepository repository;
    private final ClientSubscriptionMapper mapper;
    private final ClientRepository clientRepository;

    public ClientSubscriptionService(
            ClientSubscriptionRepository repository,
            ClientSubscriptionMapper mapper,
            ClientRepository clientRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.clientRepository = clientRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientSubscriptionResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientSubscriptionResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientSubscriptionResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientSubscriptionResponseDto create(ClientSubscriptionRequestDto request) {
        assertClientExists(request.getClientId());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientSubscriptionResponseDto update(UUID id, ClientSubscriptionRequestDto request) {
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
    protected ClientSubscription findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ClientSubscriptionException::notFound);
    }

    @Override
    protected void updateEntity(ClientSubscription entity, ClientSubscriptionRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void assertClientExists(UUID clientId) {
        clientRepository
                .findByIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientSubscriptionException::clientNotFound);
    }
}
