package br.com.gommo.core.tenant;

public final class TenantExceptions {

    private TenantExceptions() {}

    public static final String NOT_FOUND_CODE = "TENANT_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Ambiente do cliente nao encontrado";

    public static final String NOT_READY_CODE = "TENANT_NOT_READY";
    public static final String NOT_READY_MSG = "Ambiente do cliente ainda nao esta pronto";

    public static final String SUSPENDED_CODE = "TENANT_SUSPENDED";
    public static final String SUSPENDED_MSG = "Licenca suspensa ou cancelada";

    public static final String MISMATCH_CODE = "TENANT_MISMATCH";
    public static final String MISMATCH_MSG = "Token nao pertence a este ambiente";

    public static final String HOST_REQUIRED_CODE = "TENANT_HOST_REQUIRED";
    public static final String HOST_REQUIRED_MSG = "Acesso permitido apenas pelo subdominio do cliente";
}
