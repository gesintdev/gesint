package br.com.gesint.admin.modules.clientbranch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientBranchRequestDto {

    @NotNull private UUID clientId;

    @NotBlank @Size(max = 255) private String legalName;

    @Size(max = 255) private String tradeName;

    @NotBlank @Size(max = 18) private String cnpj;

    private int sortOrder;

    @Size(max = 32) private String stateRegistration;

    @Size(max = 32) private String municipalRegistration;

    @Email @Size(max = 200) private String email;

    @Size(max = 20) private String phone;

    @Size(max = 200) private String street;

    @Size(max = 20) private String number;

    @Size(max = 100) private String complement;

    @Size(max = 100) private String district;

    @Size(max = 100) private String city;

    @Size(max = 2) private String stateCode;

    @Size(max = 10) private String zipCode;
}
