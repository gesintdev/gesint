package br.com.gommo.modules.root.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TenantInfoResponseDto {

    private final String slug;
    private final String name;
    /** Keys do catalogo Admin (DP, RH, CTB) com contrato ACTIVE. */
    private final List<String> contractedSystemKeys;
}
