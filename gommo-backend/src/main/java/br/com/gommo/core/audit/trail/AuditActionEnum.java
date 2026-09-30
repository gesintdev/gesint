package br.com.gommo.core.audit.trail;

import java.util.Map;

/**
 * Acoes registradas na trilha de auditoria. A categoria e fixa por acao; a descricao e o verbo
 * exibido na coluna "Acao" (complementado pelo detalhe do evento).
 *
 * As acoes de CRUD correspondem aos metodos de {@link br.com.gommo.core.base.service.IBaseService}
 * e sao gravadas automaticamente por {@link CrudAuditTrailAspect}.
 */
public enum AuditActionEnum {
    CREATE(AuditCategoryEnum.RECORD, "Criou"),
    UPDATE(AuditCategoryEnum.RECORD, "Alterou"),
    DELETE(AuditCategoryEnum.RECORD, "Excluiu"),
    ACTIVATE(AuditCategoryEnum.RECORD, "Ativou"),
    DEACTIVATE(AuditCategoryEnum.RECORD, "Inativou"),

    SENSITIVE_READ(AuditCategoryEnum.SENSITIVE_DATA, "Leu"),
    ATTACHMENT_DOWNLOAD(AuditCategoryEnum.SENSITIVE_DATA, "Baixou anexo"),
    PAYSLIP_VIEW(AuditCategoryEnum.SENSITIVE_DATA, "Emitiu holerite"),

    APPROVE(AuditCategoryEnum.DECISION, "Aprovou"),
    REJECT(AuditCategoryEnum.DECISION, "Reprovou"),
    RETURN(AuditCategoryEnum.DECISION, "Devolveu para ajuste"),
    TERMINATE(AuditCategoryEnum.DECISION, "Registrou desligamento"),
    COMPLETE(AuditCategoryEnum.DECISION, "Concluiu"),
    CANCEL(AuditCategoryEnum.DECISION, "Cancelou"),
    CLOSE(AuditCategoryEnum.DECISION, "Fechou"),
    REOPEN(AuditCategoryEnum.DECISION, "Reabriu"),

    PERMISSION_GRANT(AuditCategoryEnum.ACCESS, "Concedeu permissão"),
    PERMISSION_REVOKE(AuditCategoryEnum.ACCESS, "Retirou permissão"),
    PROFILE_ASSIGNMENT(AuditCategoryEnum.ACCESS, "Alterou perfis do usuário"),
    PASSWORD_RESET(AuditCategoryEnum.ACCESS, "Redefiniu acesso do usuário"),
    LOGIN(AuditCategoryEnum.ACCESS, "Entrou no sistema"),
    LOGIN_FAILED(AuditCategoryEnum.ACCESS, "Tentativa de login recusada"),

    EXPORT(AuditCategoryEnum.EXPORT, "Exportou");

    private static final Map<String, AuditActionEnum> CRUD_METHODS = Map.of(
            "create", CREATE,
            "update", UPDATE,
            "delete", DELETE,
            "activate", ACTIVATE,
            "deactivate", DEACTIVATE);

    private final AuditCategoryEnum category;
    private final String description;

    AuditActionEnum(AuditCategoryEnum category, String description) {
        this.category = category;
        this.description = description;
    }

    public AuditCategoryEnum getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    /** Acao de CRUD pelo nome do metodo do servico; {@code null} se nao for CRUD. */
    public static AuditActionEnum fromCrudMethod(String methodName) {
        return CRUD_METHODS.get(methodName);
    }
}
