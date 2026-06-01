package br.com.gommo.modules.access.catalog.controller;

import br.com.gommo.modules.access.catalog.dto.PermissionModuleGroupDto;
import br.com.gommo.modules.access.catalog.service.IPermissionCatalogService;
import br.com.gommo.modules.access.entity.SystemScopeEnum;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/permission-catalog")
public class PermissionCatalogController {

    private final IPermissionCatalogService permissionCatalogService;

    public PermissionCatalogController(IPermissionCatalogService permissionCatalogService) {
        this.permissionCatalogService = permissionCatalogService;
    }

    @GetMapping
    public ResponseEntity<List<PermissionModuleGroupDto>> findBySystem(
            @RequestParam SystemScopeEnum system,
            @RequestParam(required = false) String module) {
        if (module != null && !module.isBlank()) {
            return ResponseEntity.ok(permissionCatalogService.findByModule(system, module.trim()));
        }
        return ResponseEntity.ok(permissionCatalogService.findBySystem(system));
    }
}
