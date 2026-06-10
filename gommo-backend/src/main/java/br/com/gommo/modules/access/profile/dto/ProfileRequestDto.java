package br.com.gommo.modules.access.profile.dto;

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

import br.com.gommo.modules.access.entity.SystemScopeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequestDto {

    @NotBlank @Size(max = 50) private String name;

    @Size(max = 500) private String description;

    @NotNull private SystemScopeEnum system;

    private List<UUID> permissionIds;
}
