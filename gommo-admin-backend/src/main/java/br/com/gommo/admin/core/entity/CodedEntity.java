package br.com.gommo.admin.core.entity;

/** Entidade com código sequencial inteiro (identificador amigável além do UUID). */
public interface CodedEntity {

    Integer getCode();

    void setCode(Integer code);
}
