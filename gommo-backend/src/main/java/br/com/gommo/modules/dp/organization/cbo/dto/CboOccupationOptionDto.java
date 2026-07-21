package br.com.gommo.modules.dp.organization.cbo.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CboOccupationOptionDto {
    private final UUID id;
    private final String cboCode;
    private final String name;
}
