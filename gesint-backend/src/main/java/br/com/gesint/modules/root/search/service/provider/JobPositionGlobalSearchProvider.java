package br.com.gesint.modules.root.search.service.provider;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.util.TextSearchUtils;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.root.search.document.SearchDocumentType;
import br.com.gesint.modules.root.search.dto.GlobalSearchItemDto;
import br.com.gesint.modules.root.search.service.GlobalSearchProvider;

@Component
public class JobPositionGlobalSearchProvider implements GlobalSearchProvider {

    public static final String HREF = "/organization/job-positions";

    private final JobPositionRepository jobPositionRepository;

    public JobPositionGlobalSearchProvider(JobPositionRepository jobPositionRepository) {
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    public SearchDocumentType getType() {
        return SearchDocumentType.JOB_POSITION;
    }

    @Override
    public String getLabel() {
        return "Cargos";
    }

    @Override
    public String requiredAuthority() {
        return "jobposition:read";
    }

    @Override
    public List<GlobalSearchItemDto> search(String query, int limit) {
        String pattern = TextSearchUtils.toLikePattern(query);
        if (pattern == null) {
            return List.of();
        }
        return jobPositionRepository
                .searchForGlobal(StatusEnum.DELETED, pattern, PageRequest.of(0, limit))
                .stream()
                .map(this::toItem)
                .toList();
    }

    private GlobalSearchItemDto toItem(JobPosition jobPosition) {
        String subtitle = jobPosition.getCboCode() != null && !jobPosition.getCboCode().isBlank()
                ? "CBO " + jobPosition.getCboCode()
                : null;
        return GlobalSearchItemDto.builder()
                .id(jobPosition.getId())
                .title(jobPosition.getTitle())
                .subtitle(subtitle)
                .href(HREF)
                .build();
    }
}
