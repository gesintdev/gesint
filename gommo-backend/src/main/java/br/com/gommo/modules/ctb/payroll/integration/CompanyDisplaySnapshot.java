package br.com.gommo.modules.ctb.payroll.integration;

import java.util.UUID;

public record CompanyDisplaySnapshot(
        UUID companyId, String legalName, String tradeName, String cnpj, String city, String stateCode) {

    public static CompanyDisplaySnapshot empty(UUID companyId) {
        return new CompanyDisplaySnapshot(companyId, "Empresa", "", "", "", "");
    }

    public String displayName() {
        if (tradeName != null && !tradeName.isBlank()) {
            return tradeName;
        }
        return legalName != null ? legalName : "";
    }
}
