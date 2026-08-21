package br.com.gommo.modules.cfg.access.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

class PermissionModuleCatalogTest {

    /**
     * O menu "Exames" vive no RH e suas rotas exigem occupationalexam:read. Sem o modulo nesta
     * lista, PermissionCatalogService.findByModule devolve vazio e a tela de cadastro de perfis
     * mostra "Nenhuma permissao", impedindo conceder acesso ao menu.
     */
    @Test
    void rhDeveExporOModuloDeExamesOcupacionais() {
        assertThat(PermissionModuleCatalog.modulesFor(SystemScopeEnum.RH)).contains("occupationalexam");
    }

    @Test
    void moduloDeExamesResolveParaRh() {
        assertThat(PermissionModuleCatalog.systemForModule("occupationalexam")).isEqualTo(SystemScopeEnum.RH);
    }

    /** Todo modulo exposto por um sistema precisa ser alcancavel por allModules(). */
    @Test
    void todosOsModulosDeCadaSistemaEstaoEmAllModules() {
        for (SystemScopeEnum system : SystemScopeEnum.values()) {
            assertThat(PermissionModuleCatalog.allModules())
                    .as("modulos de %s", system)
                    .containsAll(PermissionModuleCatalog.modulesFor(system));
        }
    }
}
