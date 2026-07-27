package br.com.gommo.modules.root.search.service.provider;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.dp.organization.department.entity.Department;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.dto.GlobalSearchItemDto;
import br.com.gommo.modules.root.search.service.GlobalSearchProvider;

@Component
public class DepartmentGlobalSearchProvider implements GlobalSearchProvider {

    public static final String HREF = "/organization/departments";

    private final DepartmentRepository departmentRepository;

    public DepartmentGlobalSearchProvider(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public SearchDocumentType getType() {
        return SearchDocumentType.DEPARTMENT;
    }

    @Override
    public String getLabel() {
        return "Departamentos";
    }

    @Override
    public String requiredAuthority() {
        return "department:read";
    }

    @Override
    public List<GlobalSearchItemDto> search(String query, int limit) {
        String pattern = TextSearchUtils.toLikePattern(query);
        if (pattern == null) {
            return List.of();
        }
        return departmentRepository
                .searchForGlobal(StatusEnum.DELETED, pattern, PageRequest.of(0, limit))
                .stream()
                .map(this::toItem)
                .toList();
    }

    private GlobalSearchItemDto toItem(Department department) {
        return GlobalSearchItemDto.builder()
                .id(department.getId())
                .title(department.getName())
                .subtitle(department.getCostCenter())
                .href(HREF)
                .build();
    }
}
