package br.com.gommo.modules.access.profile.dto;

import br.com.gommo.modules.access.entity.SystemScopeEnum;
import br.com.gommo.modules.root.dto.PermissionSummaryDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
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
public class ProfileRequestDto {

    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private SystemScopeEnum system;

    private List<UUID> permissionIds;
}
