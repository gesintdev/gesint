package br.com.gesint.admin.modules.address.exception;

public final class AddressExceptions {

    private AddressExceptions() {}

    public static final String INVALID_POSTAL_CODE_CODE = "ADDRESS_INVALID_POSTAL_CODE";
    public static final String INVALID_POSTAL_CODE_MSG = "Informe um CEP valido com 8 digitos.";
    public static final String POSTAL_CODE_NOT_FOUND_CODE = "ADDRESS_POSTAL_CODE_NOT_FOUND";
    public static final String POSTAL_CODE_NOT_FOUND_MSG = "CEP nao encontrado.";
    public static final String PROVIDER_UNAVAILABLE_CODE = "ADDRESS_PROVIDER_UNAVAILABLE";
    public static final String PROVIDER_UNAVAILABLE_MSG = "Nao foi possivel consultar o CEP. Tente novamente.";
}
