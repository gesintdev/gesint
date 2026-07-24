package br.com.gommo.admin.modules.adminuser.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserRequestDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserResponseDto;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;
import br.com.gommo.admin.modules.adminuser.exception.AdminUserException;
import br.com.gommo.admin.modules.adminuser.mapper.AdminUserMapper;
import br.com.gommo.admin.modules.adminuser.repository.AdminUserRepository;
import br.com.gommo.admin.modules.root.security.AccessTokenSupport;

@Service
public class AdminUserService implements IAdminUserService {

    private final AdminUserRepository repository;
    private final AdminUserMapper mapper;

    public AdminUserService(AdminUserRepository repository, AdminUserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<AdminUserResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public AdminUserResponseDto findById(UUID id) {
        return mapper.toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<AdminUserResponseDto> findPage(int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var result = repository.findAll(pageable);
        var content = result.getContent().stream()
                .filter(e -> e.getStatus() != StatusEnum.DELETED)
                .map(mapper::toResponse)
                .toList();
        return PageableResponseDto.<AdminUserResponseDto>builder()
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
    public AdminUserResponseDto create(AdminUserRequestDto request) {
        if (repository.existsActiveByUsername(request.getUsername(), StatusEnum.DELETED)) {
            throw AdminUserException.usernameExists();
        }
        if (repository.existsActiveByEmail(request.getEmail(), StatusEnum.DELETED)) {
            throw AdminUserException.emailExists();
        }
        String plainToken = AccessTokenSupport.generatePlainToken();
        AdminUser entity = AdminUser.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(null)
                .accessTokenHash(AccessTokenSupport.hashToken(plainToken))
                .firstAccessCompleted(false)
                .status(StatusEnum.ACTIVE)
                .build();
        AdminUserResponseDto response = mapper.toResponse(repository.save(entity));
        response.setAccessToken(plainToken);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public AdminUserResponseDto update(UUID id, AdminUserRequestDto request) {
        AdminUser entity = findEntity(id);
        if (!entity.getUsername().equals(request.getUsername())
                && repository.existsActiveByUsername(request.getUsername(), StatusEnum.DELETED)) {
            throw AdminUserException.usernameExists();
        }
        if (!entity.getEmail().equals(request.getEmail())
                && repository.existsActiveByEmail(request.getEmail(), StatusEnum.DELETED)) {
            throw AdminUserException.emailExists();
        }
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public AdminUserResponseDto resetAccess(UUID id) {
        AdminUser entity = findEntity(id);
        String plainToken = AccessTokenSupport.generatePlainToken();
        entity.setPasswordHash(null);
        entity.setAccessTokenHash(AccessTokenSupport.hashToken(plainToken));
        AdminUserResponseDto response = mapper.toResponse(repository.save(entity));
        response.setAccessToken(plainToken);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        AdminUser entity = findEntity(id);
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
    }

    private AdminUser findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(AdminUserException::notFound);
    }
}
