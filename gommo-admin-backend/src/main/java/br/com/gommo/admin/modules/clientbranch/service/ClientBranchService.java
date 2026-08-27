package br.com.gommo.admin.modules.clientbranch.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.repository.ClientRepository;
import br.com.gommo.admin.modules.clientbranch.dto.ClientBranchRequestDto;
import br.com.gommo.admin.modules.clientbranch.dto.ClientBranchResponseDto;
import br.com.gommo.admin.modules.clientbranch.entity.ClientBranch;
import br.com.gommo.admin.modules.clientbranch.exception.ClientBranchException;
import br.com.gommo.admin.modules.clientbranch.repository.ClientBranchRepository;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gommo.admin.modules.clientenvironmentconfig.repository.ClientEnvironmentConfigRepository;

@Service
public class ClientBranchService implements IClientBranchService {

    private static final UUID NO_EXCLUSION = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final ClientBranchRepository branchRepository;
    private final ClientRepository clientRepository;
    private final ClientEnvironmentConfigRepository environmentConfigRepository;
    private final TenantBranchProvisioner tenantBranchProvisioner;

    public ClientBranchService(
            ClientBranchRepository branchRepository,
            ClientRepository clientRepository,
            ClientEnvironmentConfigRepository environmentConfigRepository,
            TenantBranchProvisioner tenantBranchProvisioner) {
        this.branchRepository = branchRepository;
        this.clientRepository = clientRepository;
        this.environmentConfigRepository = environmentConfigRepository;
        this.tenantBranchProvisioner = tenantBranchProvisioner;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientBranchResponseDto> findAllByClientId(UUID clientId) {
        return branchRepository
                .findAllByClientIdAndStatusNotOrderBySortOrderAscLegalNameAsc(clientId, StatusEnum.DELETED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientBranchResponseDto findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientBranchResponseDto create(ClientBranchRequestDto request) {
        Client client = clientRepository
                .findByIdAndStatusNot(request.getClientId(), StatusEnum.DELETED)
                .orElseThrow(ClientBranchException::clientNotFound);

        String cnpj = normalizeCnpj(request.getCnpj());
        validateNotHeadquarters(client, cnpj);
        validateUniqueCnpj(client.getId(), null, cnpj);

        ClientBranch branch = ClientBranch.builder()
                .clientId(client.getId())
                .status(StatusEnum.ACTIVE)
                .build();
        applyRequest(branch, request, cnpj);
        branch = branchRepository.save(branch);

        syncTenant(client.getId());

        return toResponse(findEntity(branch.getId()));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public ClientBranchResponseDto update(UUID id, ClientBranchRequestDto request) {
        ClientBranch branch = findEntity(id);
        Client client = clientRepository
                .findByIdAndStatusNot(branch.getClientId(), StatusEnum.DELETED)
                .orElseThrow(ClientBranchException::clientNotFound);

        String cnpj = normalizeCnpj(request.getCnpj());
        validateNotHeadquarters(client, cnpj);
        validateUniqueCnpj(branch.getClientId(), id, cnpj);

        applyRequest(branch, request, cnpj);
        branchRepository.save(branch);

        syncTenant(branch.getClientId());

        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public void delete(UUID id) {
        ClientBranch branch = findEntity(id);
        branch.setStatus(StatusEnum.DELETED);
        branchRepository.save(branch);

        tenantBranchProvisioner.deactivateCompany(findEnvironmentConfig(branch.getClientId()), branch.getTenantCompanyId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public List<ClientBranchResponseDto> syncToTenant(UUID clientId) {
        syncTenant(clientId);
        return findAllByClientIdInternal(clientId);
    }

    private List<ClientBranchResponseDto> findAllByClientIdInternal(UUID clientId) {
        return branchRepository
                .findAllByClientIdAndStatusNotOrderBySortOrderAscLegalNameAsc(clientId, StatusEnum.DELETED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void syncTenant(UUID clientId) {
        tenantBranchProvisioner.syncBranches(clientId, findEnvironmentConfig(clientId));
    }

    private ClientEnvironmentConfig findEnvironmentConfig(UUID clientId) {
        return environmentConfigRepository
                .findByClientIdAndStatusNot(clientId, StatusEnum.DELETED)
                .orElse(null);
    }

    /** A matriz vem de Dados Basicos; repetir o CNPJ dela aqui criaria um estabelecimento duplicado. */
    private void validateNotHeadquarters(Client client, String cnpj) {
        String document = client.getDocument() == null ? "" : client.getDocument().replaceAll("\\D", "");
        if (document.isBlank()) {
            throw ClientBranchException.headquartersDocumentMissing();
        }
        if (document.equals(cnpj)) {
            throw ClientBranchException.cnpjBelongsToHeadquarters();
        }
    }

    private void applyRequest(ClientBranch branch, ClientBranchRequestDto request, String cnpj) {
        branch.setLegalName(request.getLegalName().trim());
        branch.setTradeName(trimToNull(request.getTradeName()));
        branch.setCnpj(cnpj);
        branch.setSortOrder(request.getSortOrder());
        branch.setStateRegistration(trimToNull(request.getStateRegistration()));
        branch.setMunicipalRegistration(trimToNull(request.getMunicipalRegistration()));
        branch.setEmail(trimToNull(request.getEmail()));
        branch.setPhone(trimToNull(request.getPhone()));
        branch.setStreet(trimToNull(request.getStreet()));
        branch.setNumber(trimToNull(request.getNumber()));
        branch.setComplement(trimToNull(request.getComplement()));
        branch.setDistrict(trimToNull(request.getDistrict()));
        branch.setCity(trimToNull(request.getCity()));
        branch.setStateCode(trimToNull(request.getStateCode()));
        branch.setZipCode(trimToNull(request.getZipCode()));
    }

    private void validateUniqueCnpj(UUID clientId, UUID id, String cnpj) {
        UUID excludeId = id != null ? id : NO_EXCLUSION;
        if (branchRepository.existsByClientIdAndCnpjAndStatusNotAndIdNot(
                clientId, cnpj, StatusEnum.DELETED, excludeId)) {
            throw ClientBranchException.cnpjExists();
        }
    }

    private String normalizeCnpj(String cnpj) {
        String digits = cnpj == null ? "" : cnpj.replaceAll("\\D", "");
        if (digits.length() != 14) {
            throw ClientBranchException.cnpjInvalid();
        }
        return digits;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private ClientBranch findEntity(UUID id) {
        return branchRepository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ClientBranchException::notFound);
    }

    private ClientBranchResponseDto toResponse(ClientBranch branch) {
        return ClientBranchResponseDto.builder()
                .id(branch.getId())
                .code(branch.getCode())
                .status(branch.getStatus())
                .clientId(branch.getClientId())
                .tenantCompanyId(branch.getTenantCompanyId())
                .sortOrder(branch.getSortOrder())
                .legalName(branch.getLegalName())
                .tradeName(branch.getTradeName())
                .cnpj(branch.getCnpj())
                .stateRegistration(branch.getStateRegistration())
                .municipalRegistration(branch.getMunicipalRegistration())
                .email(branch.getEmail())
                .phone(branch.getPhone())
                .street(branch.getStreet())
                .number(branch.getNumber())
                .complement(branch.getComplement())
                .district(branch.getDistrict())
                .city(branch.getCity())
                .stateCode(branch.getStateCode())
                .zipCode(branch.getZipCode())
                .provisionedAt(branch.getProvisionedAt())
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .build();
    }
}
