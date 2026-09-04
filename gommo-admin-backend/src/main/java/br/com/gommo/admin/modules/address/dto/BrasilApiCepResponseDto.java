package br.com.gommo.admin.modules.address.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BrasilApiCepResponseDto {

    private String cep;
    private String state;
    private String city;
    private String neighborhood;
    private String street;
}
