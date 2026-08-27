package br.com.gommo.modules.root.security;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.security.JwtService;
import br.com.gommo.core.tenant.TenantBranchLinkLookup;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.dp.organization.company.entity.Company;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.entity.UserRoleAssignment;
import br.com.gommo.modules.root.repository.PermissionRepository;
import br.com.gommo.modules.root.repository.RoleRepository;
import br.com.gommo.modules.root.repository.UserRoleAssignmentRepository;

/**
 * Resolve o que o usuario pode fazer em cada filial.
 *
 * O mesmo usuario pode ser admin de RH numa filial e ter apenas consulta de ponto em outra, entao
 * a resposta e um mapa filial -> permissoes, e nao uma lista unica. Vinculos com filial nula
 * valem em todas as filiais (admin de plataforma e vinculos anteriores ao backfill).
 */
@Component
public class BranchAccessResolver {

    /** Servicos pessoais do header: valem em qualquer filial para qualquer usuario autenticado. */
    private static final List<String> PERSONAL_AUTHORITIES =
            List.of("agenda:read", "agenda:write", "agenda:delete", "attendance:write", "storage:read", "storage:write");

    private static final List<String> COLLABORATOR_AUTHORITIES = List.of("notification:read", "notification:write");

    private final UserRoleAssignmentRepository assignmentRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final CompanyRepository companyRepository;
    private final TenantBranchLinkLookup branchLinkLookup;

    public BranchAccessResolver(
            UserRoleAssignmentRepository assignmentRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            CompanyRepository companyRepository,
            TenantBranchLinkLookup branchLinkLookup) {
        this.assignmentRepository = assignmentRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.companyRepository = companyRepository;
        this.branchLinkLookup = branchLinkLookup;
    }

    public BranchAccess resolve(AppUser user) {
        List<Company> branches = provisionedBranches();
        List<UserRoleAssignment> assignments = assignmentRepository.findAllByUserId(user.getId());

        Set<String> personal = new LinkedHashSet<>(PERSONAL_AUTHORITIES);
        if (user.getCollaboratorId() != null) {
            personal.addAll(COLLABORATOR_AUTHORITIES);
        }

        if (isAdmin(user)) {
            return adminAccess(branches, personal);
        }

        Map<UUID, Role> rolesById = loadRoles(assignments);
        Set<String> globalAuthorities = new LinkedHashSet<>(personal);
        Map<UUID, Set<String>> authoritiesByBranch = new LinkedHashMap<>();

        for (UserRoleAssignment assignment : assignments) {
            Role role = rolesById.get(assignment.getRoleId());
            if (role == null || role.getStatus() != StatusEnum.ACTIVE) {
                continue;
            }
            Set<String> authorities = authoritiesOf(role);
            if (assignment.getCompanyId() == null) {
                globalAuthorities.addAll(authorities);
                continue;
            }
            authoritiesByBranch
                    .computeIfAbsent(assignment.getCompanyId(), key -> new LinkedHashSet<>())
                    .addAll(authorities);
        }

        Map<UUID, List<String>> permissionsByBranch = new LinkedHashMap<>();
        List<BranchSummary> accessible = new ArrayList<>();
        boolean hasGlobalAssignment = globalAuthorities.size() > personal.size();

        for (Company branch : branches) {
            Set<String> authorities = authoritiesByBranch.get(branch.getId());
            // Sem perfil na filial e sem vinculo global, o usuario simplesmente nao a enxerga.
            if (authorities == null && !hasGlobalAssignment) {
                continue;
            }
            Set<String> merged = new LinkedHashSet<>(globalAuthorities);
            if (authorities != null) {
                merged.addAll(authorities);
            }
            permissionsByBranch.put(branch.getId(), sorted(merged));
            accessible.add(toSummary(branch));
        }

        return new BranchAccess(accessible, permissionsByBranch, sorted(globalAuthorities));
    }

    /**
     * Estabelecimentos do cliente, e nada alem disso.
     *
     * {@code company} e espelho de {@code admin.client_branch}, mas schemas antigos ainda carregam
     * linhas soltas (seed de demonstracao, cadastro manual anterior ao modelo de filiais) que nao
     * representam estabelecimento e nao podem aparecer no seletor.
     *
     * Sem vinculo nenhum no admin a filtragem e ignorada: e o caso do tenant cujo espelhamento
     * ainda nao rodou, e esconder tudo deixaria o usuario sem filial alguma para operar.
     */
    private List<Company> provisionedBranches() {
        List<Company> branches =
                companyRepository.findAllByStatusNotOrderBySortOrderAscLegalNameAsc(StatusEnum.DELETED);

        UUID clientId = TenantContextHolder.getOptional()
                .map(TenantContext::clientId)
                .orElse(null);
        if (clientId == null) {
            return branches;
        }

        Set<UUID> provisioned = branchLinkLookup.findProvisionedCompanyIds(clientId);
        if (provisioned.isEmpty()) {
            return branches;
        }
        return branches.stream()
                .filter(branch -> provisioned.contains(branch.getId()))
                .toList();
    }

    /** Perfil GLOBAL_ADMIN nao e escopado: da acesso total a todas as filiais do cliente. */
    private boolean isAdmin(AppUser user) {
        return user.getRoles() != null
                && user.getRoles().stream()
                        .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
                        .anyMatch(Role::isGlobalAdmin);
    }

    private BranchAccess adminAccess(List<Company> branches, Set<String> personal) {
        Set<String> all = new LinkedHashSet<>(personal);
        permissionRepository.findAll().stream().map(Permission::getAuthority).forEach(all::add);
        List<String> authorities = sorted(all);

        Map<UUID, List<String>> permissionsByBranch = new LinkedHashMap<>();
        List<BranchSummary> accessible = new ArrayList<>();
        for (Company branch : branches) {
            permissionsByBranch.put(branch.getId(), authorities);
            accessible.add(toSummary(branch));
        }
        return new BranchAccess(accessible, permissionsByBranch, authorities);
    }

    private Map<UUID, Role> loadRoles(List<UserRoleAssignment> assignments) {
        Set<UUID> roleIds = new LinkedHashSet<>();
        assignments.forEach(assignment -> roleIds.add(assignment.getRoleId()));
        Map<UUID, Role> rolesById = new LinkedHashMap<>();
        if (roleIds.isEmpty()) {
            return rolesById;
        }
        roleRepository.findAllById(roleIds).forEach(role -> rolesById.put(role.getId(), role));
        return rolesById;
    }

    private Set<String> authoritiesOf(Role role) {
        Set<String> authorities = new LinkedHashSet<>();
        if (role.getPermissions() != null) {
            role.getPermissions().forEach(permission -> authorities.add(permission.getAuthority()));
        }
        return authorities;
    }

    private BranchSummary toSummary(Company branch) {
        String label = branch.getTradeName() != null && !branch.getTradeName().isBlank()
                ? branch.getTradeName()
                : branch.getLegalName();
        return new BranchSummary(branch.getId(), label, branch.getCnpj(), branch.isHeadquarters());
    }

    private List<String> sorted(Set<String> authorities) {
        return authorities.stream().distinct().sorted(Comparator.naturalOrder()).toList();
    }

    public record BranchSummary(UUID id, String name, String cnpj, boolean headquarters) {}

    /**
     * @param branchIndependentPermissions permissoes que nao dependem de filial. Sustentam o
     *     tenant recem-provisionado, que ainda nao tem matriz cadastrada e por isso nao tem
     *     nenhuma filial para escopar.
     */
    public record BranchAccess(
            List<BranchSummary> branches,
            Map<UUID, List<String>> permissionsByBranch,
            List<String> branchIndependentPermissions) {

        /**
         * Conjunto que vale na maior parte das filiais e serve de base do token.
         *
         * O token so carrega as filiais que fogem desta base. Repetir a lista inteira em cada
         * filial multiplicava o tamanho do JWT pelo numero de filiais e, para um administrador com
         * o catalogo completo de permissoes, estourava o limite do cookie de sessao.
         */
        public List<String> basePermissions() {
            return permissionsByBranch.values().stream()
                    .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                    .entrySet()
                    .stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(branchIndependentPermissions);
        }

        /** Filiais (e o escopo sem filial) cujo conjunto difere de {@link #basePermissions()}. */
        public Map<String, List<String>> branchPermissionOverrides() {
            List<String> base = basePermissions();
            Map<String, List<String>> overrides = new LinkedHashMap<>();
            permissionsByBranch.forEach((branchId, authorities) -> {
                if (!authorities.equals(base)) {
                    overrides.put(branchId.toString(), authorities);
                }
            });
            if (!branchIndependentPermissions.equals(base)) {
                overrides.put(JwtService.BRANCH_INDEPENDENT_KEY, branchIndependentPermissions);
            }
            return overrides;
        }

        public List<String> branchIds() {
            return permissionsByBranch.keySet().stream().map(UUID::toString).toList();
        }
    }
}
