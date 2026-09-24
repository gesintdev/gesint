import clsx from "clsx";
import type {ReactNode} from "react";

import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {InputCheckbox} from "@/shared/components/ui/input/index";

const ACTION_LABELS: Record<string, string> = {
    read: "Consultar",
    write: "Criar / editar",
    delete: "Excluir",
    picker: "Seleção",
    export: "Exportar",
    sensitive: "Dado sensível",
    financial: "Dado financeiro",
    clinical: "Dados clínicos",
    approve: "Aprovar",
    cancel: "Cancelar",
    conclude: "Concluir",
    dashboard: "Dashboard",
    pipeline: "Esteira",
    exammatrix: "Matriz de exames",
};

/** Fallback quando a API ainda não trouxe a description (hints do HTML RN-03). */
const SENSITIVE_HINTS: Record<string, string> = {
    "collaborator:sensitive": "raça/cor, PCD",
    "collaborator:financial": "dados bancários, salário",
    "admission:sensitive": "raça/cor, PCD",
    "admission:financial": "dados bancários, salário",
    "leave:sensitive": "CID, obs. médicas",
    "occupationalexam:clinical": "clínico",
};

const SENSITIVE_ACTIONS = new Set(["sensitive", "financial", "clinical"]);

/** Rótulos amigáveis quando um menu agrega mais de um módulo (ex.: Preferências). */
const MODULE_LABELS: Record<string, string> = {
    attendance: "Ponto",
    notification: "Notificações",
    leave: "Afastamento",
    admission: "Admissão",
    collaborator: "Colaboradores",
    occupationalexam: "Exames ocupacionais",
    candidate: "Candidatos",
    exitinterview: "Entrevista de desligamento",
    offboarding: "Desligamento",
    workschedule: "Escalas",
    documenttype: "Tipos de documento",
    digitalcertificate: "Certificados digitais",
    role: "Perfis",
    user: "Usuários",
};

function actionOf(authority: string): string {
    return authority.split(":")[1] ?? authority;
}

function actionLabel(permission: PermissionSummary): string {
    const action = actionOf(permission.authority);
    const mapped = ACTION_LABELS[action];
    if (mapped) return mapped;
    const fromApi = permission.description?.trim();
    if (fromApi) return fromApi;
    return action;
}

function moduleLabel(module: string): string {
    return MODULE_LABELS[module] ?? module;
}

function groupPermissionsByModule(
    permissions: PermissionSummary[],
): Array<{module: string; label: string; permissions: PermissionSummary[]}> {
    const order: string[] = [];
    const byModule = new Map<string, PermissionSummary[]>();
    for (const permission of permissions) {
        const key = permission.module || "_";
        if (!byModule.has(key)) {
            order.push(key);
            byModule.set(key, []);
        }
        byModule.get(key)!.push(permission);
    }
    return order.map((module) => ({
        module,
        label: moduleLabel(module),
        permissions: byModule.get(module) ?? [],
    }));
}

function isSensitiveAuthority(authority: string): boolean {
    return SENSITIVE_ACTIONS.has(actionOf(authority));
}

function sensitiveHint(permission: PermissionSummary): string | null {
    const fromApi = permission.description?.trim();
    if (fromApi) return fromApi;
    return SENSITIVE_HINTS[permission.authority] ?? null;
}

function PermissionCheckboxList({
    permissions,
    selectedIds,
    onToggle,
    withHints = false,
    disabled = false,
}: {
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    withHints?: boolean;
    disabled?: boolean;
}) {
    return (
        <ul className="flex flex-col gap-1.5">
            {permissions.map((permission) => {
                const checked = selectedIds.has(permission.id);
                const hint = withHints ? sensitiveHint(permission) : null;
                const label: ReactNode = hint ? (
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs font-normal leading-none">
                            {actionLabel(permission)}
                        </span>
                        <span className="text-[10px] leading-snug font-normal text-base-content/45">
                            {hint}
                        </span>
                    </span>
                ) : (
                    actionLabel(permission)
                );
                return (
                    <li key={permission.id}>
                        <InputCheckbox
                            size="xs"
                            checked={checked}
                            disabled={disabled}
                            readOnly={disabled}
                            onCheckedChange={disabled ? undefined : (next) => onToggle(permission.id, next)}
                            label={label}
                            aria-label={
                                hint
                                    ? `${actionLabel(permission)} — ${hint}`
                                    : actionLabel(permission)
                            }
                            className={clsx(
                                "min-h-7 w-full items-center rounded px-2 py-1.5 font-normal transition-colors",
                                disabled && "cursor-default opacity-90",
                                checked
                                    ? "bg-primary/10 text-primary"
                                    : "text-base-content/85 hover:bg-base-content/5",
                                disabled && !checked && "hover:bg-transparent",
                            )}
                            labelClassName="min-w-0 flex-1 truncate text-xs font-normal leading-none"
                        />
                    </li>
                );
            })}
        </ul>
    );
}

function PermissionSection({
    title,
    titleClassName,
    permissions,
    selectedIds,
    onToggle,
    withHints = false,
    disabled = false,
}: {
    title: string;
    titleClassName: string;
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    withHints?: boolean;
    disabled?: boolean;
}) {
    const groups = groupPermissionsByModule(permissions);
    const showModuleHeaders = groups.length > 1;

    return (
        <section className="flex flex-col gap-1.5">
            <h4 className={clsx("px-2 text-[10px] font-semibold tracking-wide uppercase", titleClassName)}>
                {title}
            </h4>
            {showModuleHeaders
                ? groups.map((group) => (
                      <div key={group.module} className="flex flex-col gap-1">
                          <h5 className="px-2 text-[10px] font-medium text-base-content/45">{group.label}</h5>
                          <PermissionCheckboxList
                              permissions={group.permissions}
                              selectedIds={selectedIds}
                              onToggle={onToggle}
                              withHints={withHints}
                              disabled={disabled}
                          />
                      </div>
                  ))
                : (
                      <PermissionCheckboxList
                          permissions={permissions}
                          selectedIds={selectedIds}
                          onToggle={onToggle}
                          withHints={withHints}
                          disabled={disabled}
                      />
                  )}
        </section>
    );
}

type ProfilePermissionPanelProps = {
    menuLabel: string | null;
    permissions: PermissionSummary[];
    selectedIds: Set<string>;
    onToggle: (permissionId: string, checked: boolean) => void;
    loading?: boolean;
    readOnly?: boolean;
};

export function ProfilePermissionPanel({
    menuLabel,
    permissions,
    selectedIds,
    onToggle,
    loading,
    readOnly = false,
}: ProfilePermissionPanelProps) {
    if (loading) {
        return <div className="skeleton-shimmer m-2 h-24 flex-1 rounded"/>;
    }

    if (!menuLabel) {
        return (
            <p className="flex flex-1 items-center justify-center px-3 text-center text-xs text-base-content/45">
                Selecione um menu.
            </p>
        );
    }

    if (permissions.length === 0) {
        return (
            <p className="flex flex-1 items-center justify-center px-3 text-center text-xs text-base-content/45">
                Nenhuma permissão para &quot;{menuLabel}&quot;.
            </p>
        );
    }

    const commonPermissions = permissions.filter((p) => !isSensitiveAuthority(p.authority));
    const sensitivePermissions = permissions.filter((p) => isSensitiveAuthority(p.authority));

    return (
        <>
            <div className="shrink-0 border-b border-base-content/8 px-2 py-1">
                <h3 className="truncate text-xs font-semibold text-base-content">{menuLabel}</h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1 pt-2">
                {commonPermissions.length > 0 ? (
                    <PermissionSection
                        title="Comum"
                        titleClassName="text-base-content/50"
                        permissions={commonPermissions}
                        selectedIds={selectedIds}
                        onToggle={onToggle}
                        disabled={readOnly}
                    />
                ) : null}
                {sensitivePermissions.length > 0 ? (
                    <PermissionSection
                        title="Sensível / financeiro"
                        titleClassName="text-warning/80"
                        permissions={sensitivePermissions}
                        selectedIds={selectedIds}
                        onToggle={onToggle}
                        withHints
                        disabled={readOnly}
                    />
                ) : null}
            </div>
        </>
    );
}

export function isSensitivePermissionAuthority(authority: string): boolean {
    return isSensitiveAuthority(authority);
}
