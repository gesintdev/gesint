package br.com.gesint.admin.modules.platformemail.entity;

/** Criptografia da conexao SMTP. Gmail: STARTTLS na porta 587 ou SSL na 465. */
public enum PlatformEmailSecurityEnum {
    STARTTLS,
    SSL,
    NONE
}
