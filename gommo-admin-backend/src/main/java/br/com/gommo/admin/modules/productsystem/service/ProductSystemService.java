package br.com.gommo.admin.modules.productsystem.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.BaseService;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.productsystem.dto.ProductSystemRequestDto;
import br.com.gommo.admin.modules.productsystem.dto.ProductSystemResponseDto;
import br.com.gommo.admin.modules.productsystem.entity.ProductSystem;
import br.com.gommo.admin.modules.productsystem.exception.ProductSystemException;
import br.com.gommo.admin.modules.productsystem.mapper.ProductSystemMapper;
import br.com.gommo.admin.modules.productsystem.repository.ProductSystemRepository;

@Service
public class ProductSystemService
        extends BaseService<ProductSystem, ProductSystemRequestDto, ProductSystemResponseDto>
        implements IProductSystemService {

    private final ProductSystemRepository repository;
    private final ProductSystemMapper mapper;

    public ProductSystemService(ProductSystemRepository repository, ProductSystemMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ProductSystemResponseDto> findAll() {
        return repository.findAllByStatusNotOrderBySortOrderAscNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ProductSystemResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PageableResponseDto<ProductSystemResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ProductSystemResponseDto create(ProductSystemRequestDto request) {
        assertKeyAvailable(request.getKey(), null);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ProductSystemResponseDto update(UUID id, ProductSystemRequestDto request) {
        assertKeyAvailable(request.getKey(), id);
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected ProductSystem findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ProductSystemException::notFound);
    }

    @Override
    protected void updateEntity(ProductSystem entity, ProductSystemRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void assertKeyAvailable(String key, UUID currentId) {
        String normalized = key == null ? "" : key.trim().toUpperCase();
        boolean exists = currentId == null
                ? repository.existsByKeyIgnoreCaseAndStatusNot(normalized, StatusEnum.DELETED)
                : repository.existsByKeyIgnoreCaseAndStatusNotAndIdNot(normalized, StatusEnum.DELETED, currentId);
        if (exists) {
            throw ProductSystemException.keyAlreadyExists();
        }
    }
}
