package br.com.gommo.modules.rh.person.collaborators.address.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class PostalCodeAddressDto {
    private final String zipCode;
    private final String street;
    private final String complement;
    private final String district;
    private final UUID cityId;
    private final String cityName;
    private final Integer cityIbgeCode;
    private final UUID stateId;
    private final String stateCode;
    private final String stateName;
}
