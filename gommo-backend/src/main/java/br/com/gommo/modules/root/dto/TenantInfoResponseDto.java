package br.com.gommo.modules.root.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TenantInfoResponseDto {

    private final String slug;
    private final String name;
}
