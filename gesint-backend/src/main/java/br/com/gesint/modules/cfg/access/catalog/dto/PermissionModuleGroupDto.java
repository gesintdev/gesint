package br.com.gesint.modules.cfg.access.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import br.com.gesint.modules.root.dto.PermissionSummaryDto;

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
