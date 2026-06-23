package br.com.gommo.modules.rh.person.collaborators.address.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LocationOptionDto {
    private final UUID id;
    private final String name;
    private final String code;
    private final Integer ibgeCode;
    private final UUID stateId;
    private final String stateCode;
}
