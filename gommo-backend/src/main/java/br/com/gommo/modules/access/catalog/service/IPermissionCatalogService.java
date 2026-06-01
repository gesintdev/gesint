package br.com.gommo.modules.access.catalog.service;

import br.com.gommo.modules.access.catalog.dto.PermissionModuleGroupDto;
import br.com.gommo.modules.access.entity.SystemScopeEnum;
import java.util.List;

public interface IPermissionCatalogService {

    List<PermissionModuleGroupDto> findBySystem(SystemScopeEnum system);

    List<PermissionModuleGroupDto> findByModule(SystemScopeEnum system, String module);
}
