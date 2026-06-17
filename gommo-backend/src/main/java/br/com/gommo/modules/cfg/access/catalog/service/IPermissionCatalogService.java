package br.com.gommo.modules.cfg.access.catalog.service;

import java.util.List;

import br.com.gommo.modules.cfg.access.catalog.dto.PermissionModuleGroupDto;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

public interface IPermissionCatalogService {

    List<PermissionModuleGroupDto> findBySystem(SystemScopeEnum system);

    List<PermissionModuleGroupDto> findByModule(SystemScopeEnum system, String module);
}
