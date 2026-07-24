package br.com.gommo.modules.cfg.access.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUserRequestDto {

    @NotNull
    private UUID collaboratorId;

    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String username;

    @NotBlank
    @Email
    @Size(max = 200)
    private String email;

    private Map<SystemScopeEnum, List<UUID>> roleIdsBySystem;
}
