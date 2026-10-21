package br.com.gesint.modules.cfg.access.actingprofile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gesint.modules.cfg.access.actingprofile.entity.DataScopeEnum;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActingProfileRequestDto {

    @NotBlank
    @Size(max = 80)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private SystemScopeEnum system;

    @NotNull
    private DataScopeEnum dataScope;

    private UUID scopeRef;
}
