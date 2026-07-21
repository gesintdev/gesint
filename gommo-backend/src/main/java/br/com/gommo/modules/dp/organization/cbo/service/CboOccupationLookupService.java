package br.com.gommo.modules.dp.organization.cbo.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.cbo.dto.CboOccupationOptionDto;
import br.com.gommo.modules.dp.organization.cbo.entity.CboOccupation;
import br.com.gommo.modules.dp.organization.cbo.repository.CboOccupationRepository;

@Service
public class CboOccupationLookupService {

    private static final int MAX_PAGE_SIZE = 50;

    private final CboOccupationRepository repository;

    public CboOccupationLookupService(CboOccupationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public PageableResponseDto<CboOccupationOptionDto> search(String query, int page, int size) {
        String trimmed = query == null ? "" : query.trim();
        String term = "%" + trimmed + "%";
        String codeTerm = "%" + trimmed.replaceAll("\\D", "") + "%";
        if (codeTerm.equals("%%")) {
            codeTerm = term;
        }
        var pageable = PageRequest.of(
                Math.max(page, 0), normalizeSize(size), Sort.by("cboCode").ascending());
        var result = repository.searchByTerm(StatusEnum.ACTIVE, term, codeTerm, pageable);
        return PageableResponseDto.<CboOccupationOptionDto>builder()
                .content(result.getContent().stream().map(this::toOption).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public CboOccupationOptionDto findByCode(String cboCode) {
        String normalized = cboCode == null ? "" : cboCode.replaceAll("\\D", "");
        if (normalized.length() != 6) {
            return null;
        }
        return repository.findByCboCode(normalized).map(this::toOption).orElse(null);
    }

    private int normalizeSize(int size) {
        return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    }

    private CboOccupationOptionDto toOption(CboOccupation occupation) {
        return CboOccupationOptionDto.builder()
                .id(occupation.getId())
                .cboCode(occupation.getCboCode())
                .name(occupation.getName())
                .build();
    }
}
