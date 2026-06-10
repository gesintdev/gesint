package br.com.gommo.modules.company.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.company.dto.CompanyRequestDto;
import br.com.gommo.modules.company.dto.CompanyResponseDto;
import br.com.gommo.modules.company.entity.Company;
import br.com.gommo.modules.company.exception.CompanyException;
import br.com.gommo.modules.company.mapper.CompanyMapper;
import br.com.gommo.modules.company.repository.CompanyRepository;

@Service
public class CompanyService extends BaseService<Company, CompanyRequestDto, CompanyResponseDto>
        implements ICompanyService {

    private final CompanyRepository repository;
    private final CompanyMapper mapper;

    public CompanyService(CompanyRepository repository, CompanyMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('company:read')")
    public List<CompanyResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('company:read')")
    public CompanyResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('company:read')")
    public PageableResponseDto<CompanyResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:write')")
    public CompanyResponseDto create(CompanyRequestDto request) {
        repository.findByCnpjAndStatusNot(request.getCnpj(), StatusEnum.DELETED).ifPresent(c -> {
            throw CompanyException.cnpjAlreadyExists();
        });
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:write')")
    public CompanyResponseDto update(UUID id, CompanyRequestDto request) {
        repository
                .findByCnpjAndStatusNot(request.getCnpj(), StatusEnum.DELETED)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> {
                    throw CompanyException.cnpjAlreadyExists();
                });
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Company findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(CompanyException::notFound);
    }

    @Override
    protected void updateEntity(Company entity, CompanyRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
