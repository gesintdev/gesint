package br.com.gommo.core.audit.trail;

/** Categorias da trilha de auditoria (RN-05). */
public enum AuditCategoryEnum {
    RECORD("Cadastro"),
    SENSITIVE_DATA("Dado sensível"),
    DECISION("Decisão"),
    ACCESS("Acesso"),
    EXPORT("Exportação");

    private final String description;

    AuditCategoryEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
