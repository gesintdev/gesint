package br.com.gommo.admin.modules.client.dto;

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
public class ClientRequestDto {

    @NotBlank @Size(max = 255) private String name;

    @Size(max = 255) private String legalName;

    @NotBlank @Size(max = 100) private String slug;

    @Size(max = 18) private String document;

    private String address;

    @Size(max = 200) private String contactEmail;

    @Size(max = 120) private String contactPhone;

    private String notes;
}
