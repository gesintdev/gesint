package br.com.gommo.modules.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CompanyRequestDto {

    @NotBlank @Size(max = 255) private String legalName;

    @Size(max = 255) private String tradeName;

    @NotBlank @Size(max = 18) private String cnpj;

    @Size(max = 32) private String stateRegistration;

    @Size(max = 32) private String municipalRegistration;

    @Size(max = 200) private String email;

    @Size(max = 20) private String phone;

    @Size(max = 200) private String street;

    @Size(max = 20) private String number;

    @Size(max = 100) private String complement;

    @Size(max = 100) private String district;

    @Size(max = 100) private String city;

    @Size(max = 2) private String stateCode;

    @Size(max = 10) private String zipCode;

    @Size(max = 60) private String taxRegime;

    @Size(max = 200) private String accountantName;

    @Size(max = 200) private String accountantEmail;
}
