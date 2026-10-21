package br.com.gesint.modules.cfg.access.actingprofile.entity;

/**
 * Abrangencia de dados do perfil de atuacao (RN-03 D2).
 * ALL = toda a filial do vinculo; demais restringem abaixo da filial.
 */
public enum DataScopeEnum {
    ALL,
    DEPARTMENT,
    TEAM,
    ASSIGNED,
    SELF
}
