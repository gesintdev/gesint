package br.com.gommo.modules.cfg.access.catalog;

import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

public final class PermissionModuleCatalog {

    private static final Map<SystemScopeEnum, Set<String>> MODULES_BY_SYSTEM = new EnumMap<>(SystemScopeEnum.class);

    static {
        MODULES_BY_SYSTEM.put(
                SystemScopeEnum.CFG,
                Set.of(
                        "role",
                        "actingprofile",
                        "user",
                        "workschedule",
                        "digitalcertificate",
                        "documenttype",
                        "admission",
                        "exitinterview",
                        "developmentplanconfig",
                        "attendance",
                        "notification",
                        "audit"));
        MODULES_BY_SYSTEM.put(
                SystemScopeEnum.DP,
                Set.of(
                        "company",
                        "department",
                        "jobposition",
                        "workschedule",
                        "payment",
                        "collaborator",
                        "admission",
                        "offboarding",
                        // Sem isto, findBySystem/findByModule nao devolvem as permissoes de
                        // occupationalexam e o cadastro de perfis mostra "Nenhuma permissao"
                        // para o menu Exames no DP, impedindo conceder acesso a ele.
                        "occupationalexam",
                        "notification",
                        "agenda",
                        "attendance",
                        "leave",
                        "storage"));
        MODULES_BY_SYSTEM.put(
                SystemScopeEnum.CONTABILIDADE,
                Set.of(
                        "payroll",
                        "payrollevent",
                        "payslip",
                        "benefit",
                        "benefitenrollment",
                        "tax",
                        "notification",
                        "agenda",
                        "storage"));
        MODULES_BY_SYSTEM.put(
                SystemScopeEnum.RH,
                Set.of(
                        "collaborator",
                        "admission",
                        "exitinterview",
                        "contract",
                        "leave",
                        "performance",
                        "jobvacancy",
                        "candidate",
                        "jobvacancyapplication",
                        "developmentplan",
                        "notification",
                        "agenda",
                        "storage"));
    }

    /**
     * Modulos concedidos so explicitamente (GLOBAL_ADMIN ou perfil com a permissao): nao entram
     * no acesso dinamico do Administrador do sistema (ADM:{sistema}). Trilha de auditoria: RN-05.
     */
    private static final Set<String> EXPLICIT_GRANT_ONLY_MODULES = Set.of("audit");

    private PermissionModuleCatalog() {}

    public static Set<String> modulesFor(SystemScopeEnum system) {
        return MODULES_BY_SYSTEM.getOrDefault(system, Set.of());
    }

    /** Modulos cobertos pelo Administrador do sistema ({@code ADM:{sistema}}). */
    public static Set<String> systemAdminModulesFor(SystemScopeEnum system) {
        Set<String> modules = new LinkedHashSet<>(modulesFor(system));
        modules.removeAll(EXPLICIT_GRANT_ONLY_MODULES);
        return modules;
    }

    public static Set<String> allModules() {
        Set<String> all = new LinkedHashSet<>();
        MODULES_BY_SYSTEM.values().forEach(all::addAll);
        return all;
    }

    public static SystemScopeEnum systemForModule(String module) {
        if ("leave".equals(module)
                || "admission".equals(module)
                || "collaborator".equals(module)
                || "notification".equals(module)
                || "agenda".equals(module)
                || "storage".equals(module)
                || "workschedule".equals(module)
                || "exitinterview".equals(module)
                || "attendance".equals(module)) {
            return null;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.CFG).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)) {
            return SystemScopeEnum.CFG;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CFG).contains(module)) {
            return SystemScopeEnum.DP;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CFG).contains(module)) {
            return SystemScopeEnum.CONTABILIDADE;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CFG).contains(module)) {
            return SystemScopeEnum.RH;
        }
        return null;
    }
}
