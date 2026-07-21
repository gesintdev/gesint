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
                SystemScopeEnum.DP,
                Set.of(
                        "company",
                        "department",
                        "jobposition",
                        "workschedule",
                        "payment",
                        "offboarding",
                        "notification",
                        "leave",
                        "storage",
                        "role",
                        "user"));
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
                        "storage",
                        "role",
                        "user"));
        MODULES_BY_SYSTEM.put(
                SystemScopeEnum.RH,
                Set.of(
                        "collaborator",
                        "admission",
                        "exitinterview",
                        "contract",
                        "attendance",
                        "leave",
                        "performance",
                        "notification",
                        "storage",
                        "role",
                        "user"));
    }

    private PermissionModuleCatalog() {}

    public static Set<String> modulesFor(SystemScopeEnum system) {
        return MODULES_BY_SYSTEM.getOrDefault(system, Set.of());
    }

    public static Set<String> allModules() {
        Set<String> all = new LinkedHashSet<>();
        MODULES_BY_SYSTEM.values().forEach(all::addAll);
        return all;
    }

    public static SystemScopeEnum systemForModule(String module) {
        if ("leave".equals(module)) {
            return null;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)) {
            return SystemScopeEnum.DP;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)) {
            return SystemScopeEnum.CONTABILIDADE;
        }
        if (MODULES_BY_SYSTEM.get(SystemScopeEnum.RH).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.DP).contains(module)
                && !MODULES_BY_SYSTEM.get(SystemScopeEnum.CONTABILIDADE).contains(module)) {
            return SystemScopeEnum.RH;
        }
        return null;
    }
}
