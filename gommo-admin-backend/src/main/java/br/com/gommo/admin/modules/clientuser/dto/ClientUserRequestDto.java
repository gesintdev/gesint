package br.com.gommo.admin.modules.clientuser.dto;

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
public class ClientUserRequestDto {

    @NotNull private UUID clientId;

    @NotBlank @Size(max = 100) private String username;

    @NotBlank @Email @Size(max = 200) private String email;

    @Size(max = 200) private String displayName;
}
