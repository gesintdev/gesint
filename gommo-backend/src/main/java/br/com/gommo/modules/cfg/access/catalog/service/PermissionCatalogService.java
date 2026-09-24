package br.com.gommo.modules.cfg.access.catalog.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.security.AuthorityWildcards;
import br.com.gommo.modules.cfg.access.catalog.PermissionModuleCatalog;
import br.com.gommo.modules.cfg.access.catalog.dto.PermissionModuleGroupDto;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.security.AccessScopePolicy;
import br.com.gommo.modules.root.dto.PermissionSummaryDto;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.repository.PermissionRepository;

@Service
public class PermissionCatalogService implements IPermissionCatalogService {

    private static final Map<String, String> MODULE_LABELS = Map.ofEntries(
            Map.entry("company", "Empresas"),
            Map.entry("department", "Departamentos"),
            Map.entry("jobposition", "Cargos"),
            Map.entry("payroll", "Folha de pagamento"),
            Map.entry("payrollevent", "Eventos de folha"),
            Map.entry("payslip", "Holerites"),
            Map.entry("benefit", "Benefícios"),
            Map.entry("benefitenrollment", "Vínculos de benefício"),
            Map.entry("tax", "Obrigacoes fiscais"),
            Map.entry("payment", "Pagamentos"),
            Map.entry("notification", "Notificacoes"),
            Map.entry("collaborator", "Colaboradores"),
            Map.entry("admission", "Admissões"),
            Map.entry("offboarding", "Desligamentos"),
            Map.entry("occupationalexam", "Exames ocupacionais"),
            Map.entry("exitinterview", "Entrevistas de desligamento"),
            Map.entry("contract", "Contratos"),
            Map.entry("attendance", "Ponto"),
            Map.entry("leave", "Férias e afastamentos"),
            Map.entry("performance", "Desempenho"),
            Map.entry("storage", "Arquivos"),
            Map.entry("role", "Perfis de acesso"),
            Map.entry("actingprofile", "Atuações"),
            Map.entry("user", "Usuários"),
            Map.entry("workschedule", "Escalas"),
            Map.entry("digitalcertificate", "Certificados digitais"),
            Map.entry("documenttype", "Tipos de documento"),
            Map.entry("developmentplanconfig", "Configurações de PDI"),
            Map.entry("agenda", "Agenda"));

    private final PermissionRepository permissionRepository;
    private final AccessScopePolicy accessScopePolicy;

    public PermissionCatalogService(PermissionRepository permissionRepository, AccessScopePolicy accessScopePolicy) {
        this.permissionRepository = permissionRepository;
        this.accessScopePolicy = accessScopePolicy;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('role:read')")
    public List<PermissionModuleGroupDto> findBySystem(SystemScopeEnum system) {
        if (!accessScopePolicy.isSystemContracted(system)) {
            return List.of();
        }
        return groupPermissions(
                permissionRepository.findAllByModuleInOrderByAuthorityAsc(PermissionModuleCatalog.modulesFor(system)));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('role:read')")
    public List<PermissionModuleGroupDto> findByModule(SystemScopeEnum system, String module) {
        if (!accessScopePolicy.isSystemContracted(system)) {
            return List.of();
        }
        if (!PermissionModuleCatalog.modulesFor(system).contains(module)) {
            return List.of();
        }
        return groupPermissions(permissionRepository.findAllByModuleInOrderByAuthorityAsc(List.of(module)));
    }

    /** Quem gerencia perfis (role:write) pode oferecer o catalogo do sistema; demais so o que possuem. */
    private List<PermissionModuleGroupDto> groupPermissions(List<Permission> permissions) {
        Set<String> grantedAuthorities = accessScopePolicy.currentAuthorities();
        boolean unrestricted = AuthorityWildcards.grantsAllStrings(grantedAuthorities);
        boolean canAssignCatalog =
                unrestricted || accessScopePolicy.hasAuthority("role:write");
        Map<String, List<PermissionSummaryDto>> grouped = new LinkedHashMap<>();
        permissions.stream()
                .filter(permission ->
                        canAssignCatalog || grantedAuthorities.contains(permission.getAuthority()))
                .sorted(Comparator.comparing(Permission::getModule).thenComparing(Permission::getAuthority))
                .forEach(permission -> grouped.computeIfAbsent(permission.getModule(), key -> new ArrayList<>())
                        .add(toSummary(permission)));

        return grouped.entrySet().stream()
                .map(entry -> PermissionModuleGroupDto.builder()
                        .module(entry.getKey())
                        .label(MODULE_LABELS.getOrDefault(entry.getKey(), entry.getKey()))
                        .permissions(entry.getValue())
                        .build())
                .toList();
    }

    private PermissionSummaryDto toSummary(Permission permission) {
        return PermissionSummaryDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .authority(permission.getAuthority())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}
