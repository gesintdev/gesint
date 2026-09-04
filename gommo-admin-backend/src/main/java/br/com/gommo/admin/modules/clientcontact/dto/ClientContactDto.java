package br.com.gommo.admin.modules.clientcontact.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.admin.modules.clientcontact.entity.ClientContactType;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContactDto {

    @NotNull private ClientContactType type;

    @NotBlank @Size(max = 200) private String value;
}
