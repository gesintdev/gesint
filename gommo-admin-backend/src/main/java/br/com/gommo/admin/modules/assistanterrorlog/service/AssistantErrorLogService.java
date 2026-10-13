package br.com.gommo.admin.modules.assistanterrorlog.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.assistanterrorlog.dto.AssistantErrorLogResponseDto;
import br.com.gommo.admin.modules.assistanterrorlog.entity.AssistantErrorLog;
import br.com.gommo.admin.modules.assistanterrorlog.exception.AssistantErrorLogException;
import br.com.gommo.admin.modules.assistanterrorlog.mapper.AssistantErrorLogMapper;
import br.com.gommo.admin.modules.assistanterrorlog.repository.AssistantErrorLogRepository;

@Service
public class AssistantErrorLogService {

    private final AssistantErrorLogRepository repository;
    private final AssistantErrorLogMapper mapper;

    public AssistantErrorLogService(AssistantErrorLogRepository repository, AssistantErrorLogMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @PreAuthorize("hasAuthority('platform:admin')")
    @Transactional(readOnly = true)
    public PageableResponseDto<AssistantErrorLogResponseDto> findPage(int page, int size, String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String query = StringUtils.hasText(q) ? q.trim() : null;
        Page<AssistantErrorLog> result =
                repository.search(query, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageableResponseDto.<AssistantErrorLogResponseDto>builder()
                .content(result.getContent().stream().map(mapper::toResponse).toList())
                .page(safePage)
                .size(safeSize)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @PreAuthorize("hasAuthority('platform:admin')")
    @Transactional(readOnly = true)
    public AssistantErrorLogResponseDto findById(UUID id) {
        return repository
                .findById(id)
                .map(mapper::toResponse)
                .orElseThrow(AssistantErrorLogException::notFound);
    }
}
