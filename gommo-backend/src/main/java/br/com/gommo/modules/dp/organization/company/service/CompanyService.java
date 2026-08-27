package br.com.gommo.modules.dp.organization.company.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.branch.BranchException;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.company.dto.CompanyRequestDto;
import br.com.gommo.modules.dp.organization.company.dto.CompanyResponseDto;
import br.com.gommo.modules.dp.organization.company.entity.Company;
import br.com.gommo.modules.dp.organization.company.exception.CompanyException;
import br.com.gommo.modules.dp.organization.company.mapper.CompanyMapper;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;

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

        Company headquarters =
                repository.findByHeadquartersTrueAndStatusNot(StatusEnum.DELETED).orElse(null);
        Company entity = mapper.toEntity(request);

        if (headquarters == null) {
            // A primeira empresa do cliente e a matriz e ancora toda a arvore de filiais.
            entity.setHeadquarters(true);
            entity.setParentId(null);
        } else {
            entity.setHeadquarters(false);
            entity.setParentId(resolveParentId(request.getParentId(), headquarters));
        }

        return mapper.toResponse(repository.save(entity));
    }

    /** Filial sempre pende de uma empresa existente; na duvida, da matriz. */
    private UUID resolveParentId(UUID requestedParentId, Company headquarters) {
        if (requestedParentId == null) {
            return headquarters.getId();
        }
        return repository
                .findByIdAndStatusNot(requestedParentId, StatusEnum.DELETED)
                .map(Company::getId)
                .orElseThrow(BranchException::notFound);
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

        Company entity = findEntity(id);
        if (!entity.isHeadquarters()) {
            Company headquarters = repository
                    .findByHeadquartersTrueAndStatusNot(StatusEnum.DELETED)
                    .orElseThrow(BranchException::headquartersRequired);
            UUID parentId = resolveParentId(request.getParentId(), headquarters);
            if (parentId.equals(entity.getId())) {
                throw BranchException.notFound();
            }
            entity.setParentId(parentId);
        }

        return super.update(id, request);
    }

    
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('company:read')")
    public List<CompanyResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('company:delete')")
    public void delete(UUID id) {
        Company entity = findEntity(id);
        if (entity.isHeadquarters() && repository.existsByParentIdAndStatusNot(id, StatusEnum.DELETED)) {
            throw BranchException.headquartersCannotBeDeleted();
        }
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
