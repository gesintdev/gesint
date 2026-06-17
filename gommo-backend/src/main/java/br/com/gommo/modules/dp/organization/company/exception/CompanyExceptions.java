package br.com.gommo.modules.dp.organization.company.exception;

public final class CompanyExceptions {

    private CompanyExceptions() {}

    public static final String NOT_FOUND_CODE = "COMPANY_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Empresa não encontrada";

    public static final String CNPJ_ALREADY_EXISTS_CODE = "COMPANY_CNPJ_ALREADY_EXISTS";
    public static final String CNPJ_ALREADY_EXISTS_MSG = "CNPJ já cadastrado";
}
