package br.com.gesint.modules.cfg.access.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

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

    /**
     * Perfis do usuario por filial e por sistema.
     *
     * A filial e a camada mais externa porque o mesmo usuario pode ter acessos diferentes em cada
     * uma: admin de RH numa e apenas consulta de ponto em outra.
     */
    private Map<UUID, Map<SystemScopeEnum, List<UUID>>> roleIdsByBranch;

    /**
     * Perfis de atuacao do usuario por filial e por sistema.
     * Mesma forma de {@link #roleIdsByBranch}.
     */
    private Map<UUID, Map<SystemScopeEnum, List<UUID>>> actingProfileIdsByBranch;
}
