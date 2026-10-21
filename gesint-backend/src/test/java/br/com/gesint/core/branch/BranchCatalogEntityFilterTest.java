package br.com.gesint.core.branch;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.Filter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

class BranchCatalogEntityFilterTest {

    private static final String ENTITY_BASE_PACKAGE = "br.com.gesint.modules";

    @Test
    @DisplayName("toda entidade de catalogo por filial declara o filtro branchCatalogScope")
    void everyBranchCatalogEntityDeclaresTheFilter() {
        List<String> missingFilter = new ArrayList<>();

        for (Class<?> entity : branchCatalogEntities()) {
            Filter filter = entity.getAnnotation(Filter.class);
            if (filter == null || !BranchCatalogEntity.FILTER_NAME.equals(filter.name())) {
                missingFilter.add(entity.getName());
            }
        }

        assertThat(missingFilter)
                .as(
                        "Entidades sem @Filter(name = BranchCatalogEntity.FILTER_NAME, "
                                + "condition = BranchCatalogEntity.FILTER_CONDITION)")
                .isEmpty();
    }

    @Test
    @DisplayName("BranchCatalogTables reflete exatamente as entidades de catalogo")
    void catalogTablesMatchCatalogEntities() {
        Set<String> fromEntities = branchCatalogEntities().stream()
                .map(entity -> entity.getAnnotation(Table.class))
                .filter(table -> table != null && !table.name().isBlank())
                .map(Table::name)
                .collect(Collectors.toSet());

        assertThat(BranchCatalogTables.NAMES).isEqualTo(fromEntities);
    }

    private List<Class<?>> branchCatalogEntities() {
        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AssignableTypeFilter(BranchCatalogEntity.class));

        List<Class<?>> entities = new ArrayList<>();
        for (BeanDefinition definition : scanner.findCandidateComponents(ENTITY_BASE_PACKAGE)) {
            Class<?> type = resolve(definition.getBeanClassName());
            if (type != null && type.isAnnotationPresent(Entity.class)) {
                entities.add(type);
            }
        }
        return entities;
    }

    private Class<?> resolve(String className) {
        try {
            return Class.forName(className);
        } catch (ClassNotFoundException ex) {
            return null;
        }
    }
}
