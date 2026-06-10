package br.com.gommo.admin.modules.clientpayment.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentRequestDto;
import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentResponseDto;
import br.com.gommo.admin.modules.clientpayment.entity.ClientPayment;
import br.com.gommo.admin.modules.clientpayment.exception.ClientPaymentException;
import br.com.gommo.admin.modules.clientpayment.mapper.ClientPaymentMapper;
import br.com.gommo.admin.modules.clientpayment.repository.ClientPaymentRepository;

@Service
public class ClientPaymentService extends BaseService<ClientPayment, ClientPaymentRequestDto, ClientPaymentResponseDto>
        implements IClientPaymentService {

    private final ClientPaymentRepository repository;
    private final ClientPaymentMapper mapper;
    private final ClientRepository clientRepository;

    public ClientPaymentService(
            ClientPaymentRepository repository, ClientPaymentMapper mapper, ClientRepository clientRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.clientRepository = clientRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientPaymentResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientPaymentResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientPaymentResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientPaymentResponseDto create(ClientPaymentRequestDto request) {
        assertClientExists(request.getClientId());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientPaymentResponseDto update(UUID id, ClientPaymentRequestDto request) {
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
    protected ClientPayment findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ClientPaymentException::notFound);
    }

    @Override
    protected void updateEntity(ClientPayment entity, ClientPaymentRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void assertClientExists(UUID clientId) {
        clientRepository
                .findByIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElseThrow(ClientPaymentException::clientNotFound);
    }
}
