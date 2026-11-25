package br.com.gesint.admin.modules.platformemail.service;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

/** Dados seguros para o e-mail de primeiro acesso do usuario do cliente (sem IDs internos/precos). */
@Getter
@Builder
public class ClientFirstAccessMailContext {

    private final String clientName;
    private final String clientLegalName;
    private final String slug;
    private final String displayName;
    private final String username;
    private final String email;

    @Builder.Default
    private final List<ContractedSystemLine> systems = new ArrayList<>();

    @Getter
    @Builder
    public static class ContractedSystemLine {
        private final String name;
        private final String moduleKey;
        private final String contractType;
        private final String contractDate;
        private final String endDate;
        private final boolean withAi;
        private final String operationalStatus;
    }
}
