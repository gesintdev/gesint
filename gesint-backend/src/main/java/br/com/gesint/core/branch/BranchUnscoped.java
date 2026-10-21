package br.com.gesint.core.branch;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Suspende o filtro de filial no metodo anotado, permitindo leitura consolidada de todas as
 * filiais do cliente.
 *
 * Use com parcimonia e sempre de forma deliberada: relatorios consolidados, resolucao das
 * filiais a que o usuario tem acesso e rotinas de manutencao. Em qualquer outro lugar,
 * suspender o escopo e vazamento de dados entre filiais.
 */
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface BranchUnscoped {}
