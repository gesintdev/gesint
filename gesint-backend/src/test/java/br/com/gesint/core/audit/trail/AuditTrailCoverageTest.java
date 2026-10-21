package br.com.gesint.core.audit.trail;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;

import br.com.gesint.core.base.service.BaseService;

/**
 * Todo servico de CRUD grava na trilha pelo {@link CrudAuditTrailAspect}; sem rotulo em
 * {@link AuditRecordLabels} a coluna "Registro" mostraria o nome da classe Java.
 */
class AuditTrailCoverageTest {

    @Test
    @DisplayName("toda entidade de servico BaseService tem rotulo na trilha")
    void everyBaseServiceEntityHasRecordLabel() {
        List<String> missing = new ArrayList<>();
        for (Class<?> service : baseServices()) {
            Class<?> entity = CrudAuditTrailAspect.entityTypeOf(service);
            assertThat(entity).as("tipo da entidade de %s", service.getName()).isNotNull();
            if (!AuditRecordLabels.has(entity)) {
                missing.add(entity.getSimpleName() + " (" + service.getSimpleName() + ")");
            }
        }

        assertThat(missing).as("Adicione o rotulo em AuditRecordLabels").isEmpty();
    }

    @Test
    @DisplayName("o scan encontra os servicos, senao o teste seria vacuo")
    void scanFindsServices() {
        assertThat(baseServices()).hasSizeGreaterThan(30);
    }

    @Test
    @DisplayName("metodos de CRUD mapeiam para acoes da categoria Cadastro")
    void crudMethodsMapToRecordCategory() {
        for (String method : List.of("create", "update", "delete", "activate", "deactivate")) {
            assertThat(AuditActionEnum.fromCrudMethod(method))
                    .as(method)
                    .isNotNull()
                    .extracting(AuditActionEnum::getCategory)
                    .isEqualTo(AuditCategoryEnum.RECORD);
        }
        assertThat(AuditActionEnum.fromCrudMethod("findById")).isNull();
    }

    @Test
    @DisplayName("acoes cabem na coluna action VARCHAR(40)")
    void actionNamesFitColumn() {
        for (AuditActionEnum action : AuditActionEnum.values()) {
            assertThat(action.name().length()).as(action.name()).isLessThanOrEqualTo(40);
        }
    }

    private static List<Class<?>> baseServices() {
        ClassPathScanningCandidateComponentProvider scanner =
                new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AssignableTypeFilter(BaseService.class));

        List<Class<?>> services = new ArrayList<>();
        for (BeanDefinition definition : scanner.findCandidateComponents("br.com.gesint.modules")) {
            try {
                Class<?> type = Class.forName(definition.getBeanClassName());
                if (!Modifier.isAbstract(type.getModifiers())) {
                    services.add(type);
                }
            } catch (ClassNotFoundException ex) {
                throw new IllegalStateException(ex);
            }
        }
        return services;
    }
}
