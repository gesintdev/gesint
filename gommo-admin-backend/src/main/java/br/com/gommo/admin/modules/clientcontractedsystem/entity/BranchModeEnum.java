package br.com.gommo.admin.modules.clientcontractedsystem.entity;

/** Onde o sistema contratado vale dentro da estrutura de estabelecimentos do cliente. */
public enum BranchModeEnum {
    /** Todas as filiais, inclusive as cadastradas depois. E o default. */
    ALL,
    /** Apenas as filiais listadas em {@code client_contracted_system_branch}. */
    SELECTED
}
