package br.com.gommo.admin.modules.clientuser.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.client.service.TenantUserProvisioner;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserRequestDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserResponseDto;
import br.com.gommo.admin.modules.clientuser.entity.ClientUser;
import br.com.gommo.admin.modules.clientuser.exception.ClientUserException;
import br.com.gommo.admin.modules.clientuser.repository.ClientUserRepository;

@Service
public class ClientUserService implements IClientUserService {

    private final ClientUserRepository clientUserRepository;
    private final ClientRepository clientRepository;
    private final TenantUserProvisioner tenantUserProvisioner;
    private final PasswordEncoder passwordEncoder;

    public ClientUserService(
            ClientUserRepository clientUserRepository,
            ClientRepository clientRepository,
            TenantUserProvisioner tenantUserProvisioner,
            PasswordEncoder passwordEncoder) {
        this.clientUserRepository = clientUserRepository;
        this.clientRepository = clientRepository;
        this.tenantUserProvisioner = tenantUserProvisioner;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientUserResponseDto> findAll() {
        return clientUserRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientUserResponseDto findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ClientUserResponseDto> findPage(int page, int size) {
        var result = clientUserRepository.findAll(PageRequest.of(page, size));
        var content = result.getContent().stream()
                .filter(e -> e.getStatus() != StatusEnum.DELETED)
                .map(this::toResponse)
                .toList();
        return PageableResponseDto.<ClientUserResponseDto>builder()
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
    public ClientUserResponseDto create(ClientUserRequestDto request) {
        Client client = clientRepository
                .findByIdAndStatusNot(request.getClientId(), StatusEnum.DELETED)
                .orElseThrow(ClientUserException::clientNotFound);

        validateUniqueCredentials(request.getClientId(), null, request.getUsername(), request.getEmail());
        validatePassword(request.getPassword(), true);

        ClientUser link = ClientUser.builder()
                .clientId(client.getId())
                .username(request.getUsername().trim())
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(
                        StringUtils.hasText(request.getDisplayName())
                                ? request.getDisplayName()
                                : request.getUsername())
                .status(StatusEnum.ACTIVE)
                .build();
        link = clientUserRepository.save(link);

        if (client.getProvisioningStatus() == TenantProvisioningStatusEnum.READY) {
            tenantUserProvisioner.provisionUser(client, link);
        }

        return toResponse(link, client);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientUserResponseDto update(UUID id, ClientUserRequestDto request) {
        ClientUser link = findEntity(id);
        Client client = clientRepository
                .findByIdAndStatusNot(request.getClientId(), StatusEnum.DELETED)
                .orElseThrow(ClientUserException::clientNotFound);

        validateUniqueCredentials(request.getClientId(), id, request.getUsername(), request.getEmail());
        validatePassword(request.getPassword(), false);

        link.setClientId(client.getId());
        link.setUsername(request.getUsername().trim());
        link.setEmail(request.getEmail().trim());
        if (StringUtils.hasText(request.getPassword())) {
            link.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        link.setDisplayName(
                StringUtils.hasText(request.getDisplayName()) ? request.getDisplayName() : request.getUsername());
        clientUserRepository.save(link);

        if (link.getTenantAppUserId() != null && client.getProvisioningStatus() == TenantProvisioningStatusEnum.READY) {
            tenantUserProvisioner.syncTenantUserCredentials(client, link);
        }

        return toResponse(link, client);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        ClientUser link = findEntity(id);
        link.setStatus(StatusEnum.DELETED);
        clientUserRepository.save(link);

        clientRepository.findById(link.getClientId()).ifPresent(client -> {
            if (link.getTenantAppUserId() != null) {
                tenantUserProvisioner.deactivateTenantUser(client, link.getTenantAppUserId());
            }
        });
    }

    private void validateUniqueCredentials(UUID clientId, UUID id, String username, String email) {
        String normalizedUsername = username.trim();
        String normalizedEmail = email.trim();
        UUID excludeId = id != null ? id : UUID.fromString("00000000-0000-0000-0000-000000000000");

        if (clientUserRepository.existsByClientIdAndUsernameIgnoreCaseAndStatusNotAndIdNot(
                clientId, normalizedUsername, StatusEnum.DELETED, excludeId)) {
            throw ClientUserException.usernameExists();
        }
        if (clientUserRepository.existsByEmailIgnoreCaseAndStatusNotAndIdNot(
                normalizedEmail, StatusEnum.DELETED, excludeId)) {
            throw ClientUserException.emailExists();
        }
    }

    private void validatePassword(String password, boolean required) {
        if (!StringUtils.hasText(password)) {
            if (required) {
                throw ClientUserException.passwordRequired();
            }
            return;
        }
        if (password.length() < 8) {
            throw ClientUserException.passwordTooShort();
        }
    }

    private ClientUser findEntity(UUID id) {
        return clientUserRepository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ClientUserException::notFound);
    }

    private ClientUserResponseDto toResponse(ClientUser link) {
        Client client = clientRepository.findById(link.getClientId()).orElse(null);
        return toResponse(link, client);
    }

    private ClientUserResponseDto toResponse(ClientUser link, Client client) {
        return ClientUserResponseDto.builder()
                .id(link.getId())
                .code(link.getCode())
                .status(link.getStatus())
                .clientId(link.getClientId())
                .clientName(client != null ? client.getName() : null)
                .appUserId(link.getTenantAppUserId())
                .username(link.getUsername())
                .email(link.getEmail())
                .displayName(link.getDisplayName())
                .provisionedAt(link.getProvisionedAt())
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }
}
