package br.com.gommo.admin.modules.client.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import br.com.gommo.admin.modules.clientcontact.dto.ClientContactDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequestDto {

    @NotBlank @Size(max = 255) private String name;

    @Size(max = 255) private String legalName;

    @NotBlank @Size(max = 100) private String slug;

    @Size(max = 18) private String document;

    @Size(max = 200) private String street;

    @Size(max = 20) private String number;

    @Size(max = 100) private String complement;

    @Size(max = 100) private String district;

    @Size(max = 100) private String city;

    @Size(max = 2) private String stateCode;

    @Size(max = 10) private String zipCode;

    @Valid @Builder.Default private List<ClientContactDto> contacts = new ArrayList<>();

    private String notes;
}
