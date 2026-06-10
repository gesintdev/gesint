package br.com.gommo.modules.access.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUserRequestDto {

    @NotNull private UUID collaboratorId;

    @NotBlank @Size(max = 100) private String username;

    @NotBlank @Email @Size(max = 200) private String email;

    @Size(min = 6, max = 100) private String password;

    private List<UUID> dpRoleIds;

    private List<UUID> rhRoleIds;
}
