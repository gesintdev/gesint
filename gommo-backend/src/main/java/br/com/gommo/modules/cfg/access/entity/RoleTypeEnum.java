package br.com.gommo.modules.cfg.access.entity;

/**
 * GLOBAL_ADMIN: acesso total a todos os sistemas (usuario de primeiro acesso do cliente).
 * ADMIN: acesso total dentro do sistema vinculado; existe um por sistema e nao pode ser editado.
 * INTERNAL: perfis tecnicos da plataforma, invisiveis no cadastro de perfis.
 * CUSTOM: perfis criados pelo cliente.
 */
public enum RoleTypeEnum {
    GLOBAL_ADMIN,
    ADMIN,
    INTERNAL,
    CUSTOM
}
