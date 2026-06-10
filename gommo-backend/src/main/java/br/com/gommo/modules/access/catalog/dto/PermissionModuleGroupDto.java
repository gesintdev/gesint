package br.com.gommo.modules.access.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import br.com.gommo.modules.root.dto.PermissionSummaryDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionModuleGroupDto {

    private String module;
    private String label;
    private List<PermissionSummaryDto> permissions;
}
