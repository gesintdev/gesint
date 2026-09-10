package br.com.gommo.modules.cfg.access.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

class PermissionModuleCatalogTest {

    /**
     * Exames ocupacionais vivem no rail DP (clinicas/medicos em Organizacao; matriz no Cargo;
     * aba Exames na Admissao). Sem o modulo em DP, o cadastro de perfis nao concede as authorities.
     */
    @Test
    void dpDeveExporOModuloDeExamesOcupacionais() {
        assertThat(PermissionModuleCatalog.modulesFor(SystemScopeEnum.DP)).contains("occupationalexam");
    }

    @Test
    void moduloDeExamesResolveParaDp() {
        assertThat(PermissionModuleCatalog.systemForModule("occupationalexam")).isEqualTo(SystemScopeEnum.DP);
    }

    @Test
    void rhNaoExpoeMaisOModuloDeExamesOcupacionais() {
        assertThat(PermissionModuleCatalog.modulesFor(SystemScopeEnum.RH)).doesNotContain("occupationalexam");
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
