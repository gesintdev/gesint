package br.com.gommo.admin.modules.clientuser.service;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserRequestDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserResponseDto;
import br.com.gommo.admin.modules.clientuser.entity.ClientUser;
import br.com.gommo.admin.modules.clientuser.exception.ClientUserException;
import br.com.gommo.admin.modules.clientuser.repository.ClientUserRepository;
import br.com.gommo.admin.modules.integration.entity.PublicAppUser;
import br.com.gommo.admin.modules.integration.entity.PublicRole;
import br.com.gommo.admin.modules.integration.repository.PublicAppUserRepository;
import br.com.gommo.admin.modules.integration.repository.PublicRoleRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ClientUserService implements IClientUserService {

    private static final UUID HR_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private final ClientUserRepository clientUserRepository;
    private final ClientRepository clientRepository;
    private final PublicAppUserRepository publicAppUserRepository;
    private final PublicRoleRepository publicRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public ClientUserService(
            ClientUserRepository clientUserRepository,
            ClientRepository clientRepository,
            PublicAppUserRepository publicAppUserRepository,
            PublicRoleRepository publicRoleRepository,
            PasswordEncoder passwordEncoder) {
        this.clientUserRepository = clientUserRepository;
        this.clientRepository = clientRepository;
        this.publicAppUserRepository = publicAppUserRepository;
        this.publicRoleRepository = publicRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientUserResponseDto> findAll() {
        return clientUserRepository.findAllByStatusNot(StatusEnum.DELETED).stream()
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

        if (publicAppUserRepository.existsByUsername(request.getUsername())) {
            throw ClientUserException.usernameExists();
        }
        if (publicAppUserRepository.existsByEmail(request.getEmail())) {
            throw ClientUserException.emailExists();
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw ClientUserException.passwordRequired();
        }

        PublicRole hrRole = publicRoleRepository.findById(HR_ROLE_ID).orElseThrow();

        PublicAppUser appUser = PublicAppUser.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(StatusEnum.ACTIVE)
                .roles(Set.of(hrRole))
                .build();
        appUser = publicAppUserRepository.save(appUser);

        ClientUser link = ClientUser.builder()
                .clientId(client.getId())
                .appUserId(appUser.getId())
                .displayName(StringUtils.hasText(request.getDisplayName()) ? request.getDisplayName() : request.getUsername())
                .status(StatusEnum.ACTIVE)
                .build();
        link = clientUserRepository.save(link);

        return toResponse(link, client, appUser);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientUserResponseDto update(UUID id, ClientUserRequestDto request) {
        ClientUser link = findEntity(id);
        Client client = clientRepository
                .findByIdAndStatusNot(request.getClientId(), StatusEnum.DELETED)
                .orElseThrow(ClientUserException::clientNotFound);

        PublicAppUser appUser = publicAppUserRepository
                .findById(link.getAppUserId())
                .orElseThrow(ClientUserException::notFound);

        if (!appUser.getUsername().equals(request.getUsername())
                && publicAppUserRepository.existsByUsername(request.getUsername())) {
            throw ClientUserException.usernameExists();
        }
        if (!appUser.getEmail().equals(request.getEmail()) && publicAppUserRepository.existsByEmail(request.getEmail())) {
            throw ClientUserException.emailExists();
        }

        appUser.setUsername(request.getUsername());
        appUser.setEmail(request.getEmail());
        if (StringUtils.hasText(request.getPassword())) {
            appUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        publicAppUserRepository.save(appUser);

        link.setClientId(client.getId());
        link.setDisplayName(
                StringUtils.hasText(request.getDisplayName()) ? request.getDisplayName() : request.getUsername());
        clientUserRepository.save(link);

        return toResponse(link, client, appUser);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        ClientUser link = findEntity(id);
        link.setStatus(StatusEnum.DELETED);
        clientUserRepository.save(link);

        publicAppUserRepository.findById(link.getAppUserId()).ifPresent(appUser -> {
            appUser.setStatus(StatusEnum.DELETED);
            publicAppUserRepository.save(appUser);
        });
    }

    private ClientUser findEntity(UUID id) {
        return clientUserRepository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ClientUserException::notFound);
    }

    private ClientUserResponseDto toResponse(ClientUser link) {
        Client client = clientRepository.findById(link.getClientId()).orElse(null);
        PublicAppUser appUser =
                publicAppUserRepository.findById(link.getAppUserId()).orElse(null);
        return toResponse(link, client, appUser);
    }

    private ClientUserResponseDto toResponse(ClientUser link, Client client, PublicAppUser appUser) {
        return ClientUserResponseDto.builder()
                .id(link.getId())
                .status(link.getStatus())
                .clientId(link.getClientId())
                .clientName(client != null ? client.getName() : null)
                .appUserId(link.getAppUserId())
                .username(appUser != null ? appUser.getUsername() : null)
                .email(appUser != null ? appUser.getEmail() : null)
                .displayName(link.getDisplayName())
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }
}
