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

/**
 * O Hibernate ignora {@code @Filter} declarado em {@code @MappedSuperclass}, entao cada entidade
 * escopada precisa repetir a anotacao. Uma entidade que esqueca passa a listar dados de todas as
 * filiais silenciosamente, sem erro de compilacao nem falha em runtime.
 *
 * Este teste transforma esse esquecimento em build quebrado.
 */
class BranchScopedEntityFilterTest {

    private static final String ENTITY_BASE_PACKAGE = "br.com.gesint.modules";

    @Test
    @DisplayName("toda entidade escopada por filial declara o filtro branchScope")
    void everyBranchScopedEntityDeclaresTheFilter() {
        List<String> missingFilter = new ArrayList<>();

        for (Class<?> entity : branchScopedEntities()) {
            Filter filter = entity.getAnnotation(Filter.class);
            if (filter == null || !BranchScopedEntity.FILTER_NAME.equals(filter.name())) {
                missingFilter.add(entity.getName());
            }
        }

        assertThat(missingFilter)
                .as(
                        "Entidades sem @Filter(name = BranchScopedEntity.FILTER_NAME, "
                                + "condition = BranchScopedEntity.FILTER_CONDITION): dados vazariam entre filiais")
                .isEmpty();
    }

    @Test
    @DisplayName("o scan encontra as entidades escopadas, senao o teste seria vacuo")
    void scanFindsBranchScopedEntities() {
        assertThat(branchScopedEntities()).hasSizeGreaterThan(20);
    }

    @Test
    @DisplayName("BranchScopedTables reflete exatamente as entidades escopadas")
    void scopedTablesMatchScopedEntities() {
        Set<String> fromEntities = branchScopedEntities().stream()
                .map(entity -> entity.getAnnotation(Table.class))
                .filter(table -> table != null && !table.name().isBlank())
                .map(Table::name)
                .collect(Collectors.toSet());

        assertThat(BranchScopedTables.NAMES)
                .as("SQL nativo consulta esta lista para decidir se aplica o predicado de filial")
                .isEqualTo(fromEntities);
    }

    private List<Class<?>> branchScopedEntities() {
        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AssignableTypeFilter(BranchScopedEntity.class));

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
