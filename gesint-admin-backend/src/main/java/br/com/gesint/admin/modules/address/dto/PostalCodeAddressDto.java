package br.com.gesint.admin.modules.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostalCodeAddressDto {

    private String zipCode;
    private String street;
    private String complement;
    private String district;
    private String city;
    private String stateCode;
}
