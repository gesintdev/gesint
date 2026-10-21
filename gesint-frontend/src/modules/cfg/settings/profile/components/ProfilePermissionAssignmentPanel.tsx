"use client";

import clsx from "clsx";
import {Plus, Trash2} from "lucide-react";

import {
    type SystemScope,
    systemScopeInfos,
    systemScopeLabel,
    systemScopeShortLabel,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {ProfilePermissionPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionPanel";
import type {PermissionSummary} from "@/modules/cfg/settings/profile/dto/profile.dto";
import type {ProfileDraftItem} from "@/modules/cfg/settings/profile/lib/profile-form-draft";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {NavRouteTree} from "@/shared/components/layout/NavRouteTree";
import {Button} from "@/shared/components/ui/Button";
import {type CheckboxState, InputString} from "@/shared/components/ui/input/index";

type ProfilePermissionAssignmentPanelProps = {
    system: SystemScope;
    /** Sistemas contratados pelo cliente e acessiveis ao usuario logado. */
    availableSystems: SystemScope[];
    onSystemChange: (system: SystemScope) => void;
    systemProfileCountByScope: Partial<Record<SystemScope, number>>;
    systemsLocked?: boolean;
    draftsForSystem: ProfileDraftItem[];
    activeDraft: ProfileDraftItem | null;
    onSelectDraft: (clientId: string) => void;
    onAddDraft: () => void;
    onRemoveDraft: (clientId: string) => void;
    allowMultipleDrafts: boolean;
    name: string;
    description: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    navSections: NavSection[];
    selectedRoute: AppRoute | null;
    markedRouteIds: ReadonlySet<string>;
    routeAccessStateById: ReadonlyMap<string, CheckboxState>;
    onRouteAccessToggle: (route: AppRoute) => void;
    onSelectAllMenus: () => void;
    allMenusAccessState: CheckboxState;
    onRouteSelect: (route: AppRoute) => void;
    permissions: PermissionSummary[];
    selectedPermissionIds: Set<string>;
    onTogglePermission: (permissionId: string, checked: boolean) => void;
    permissionsLoading?: boolean;
    /** Perfil ADMIN do sistema: visualizacao com tudo marcado e desabilitado. */
    readOnly?: boolean;
};

export function ProfilePermissionAssignmentPanel({
    system,
    availableSystems,
    onSystemChange,
    systemProfileCountByScope,
    systemsLocked = false,
    draftsForSystem,
    activeDraft,
    onSelectDraft,
    onAddDraft,
    onRemoveDraft,
    allowMultipleDrafts,
    name,
    description,
    onNameChange,
    onDescriptionChange,
    navSections,
    selectedRoute,
    markedRouteIds,
    routeAccessStateById,
    onRouteAccessToggle,
    onSelectAllMenus,
    allMenusAccessState,
    onRouteSelect,
    permissions,
    selectedPermissionIds,
    onTogglePermission,
    permissionsLoading,
    readOnly = false,
}: ProfilePermissionAssignmentPanelProps) {
    return (
        <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden sm:col-span-12 lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 bg-base-200/25 lg:border-r lg:border-b-0">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Sistemas
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Selecione o sistema para configurar perfis
                    </p>
                </div>
                <ul className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3">
                    {availableSystems.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-base-content/15 px-3 py-4 text-center text-xs text-base-content/50">
                            Nenhum sistema disponível para o seu acesso.
                        </li>
                    ) : null}
                    {availableSystems.map((scope) => {
                        const infos = systemScopeInfos(scope);
                        const Icon = infos.icon;
                        const active = scope === system;
                        const profileCount = systemProfileCountByScope[scope] ?? 0;
                        const disabled = systemsLocked && !active;
                        return (
                            <li key={scope}>
                                <button
                                    type="button"
                                    title={systemScopeLabel(scope)}
                                    disabled={disabled}
                                    onClick={() => onSystemChange(scope)}
                                    className={clsx(
                                        "group flex w-full items-center gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200",
                                        active
                                            ? "border-primary/35 bg-primary/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                                            : "border-base-content/10 bg-base-100 hover:border-base-content/18 hover:bg-base-100 hover:shadow-sm",
                                        disabled && "cursor-not-allowed opacity-45 hover:border-base-content/10 hover:shadow-none",
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                            active
                                                ? "bg-primary text-primary-content shadow-sm"
                                                : "bg-base-200 text-base-content/65 group-hover:bg-primary/10 group-hover:text-primary",
                                        )}
                                    >
                                        <Icon className="size-5" strokeWidth={2} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={clsx(
                                                "block truncate text-sm font-semibold",
                                                active ? "text-primary" : "text-base-content",
                                            )}
                                        >
                                            {infos.name}
                                        </span>
                                        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-base-content/50">
                                            <span className="font-medium tracking-wide uppercase">
                                                {systemScopeShortLabel(scope)}
                                            </span>
                                            <span className="text-base-content/25">·</span>
                                            <span>
                                                {profileCount === 0
                                                    ? "Nenhum perfil"
                                                    : profileCount === 1
                                                      ? "1 perfil"
                                                      : `${profileCount} perfis`}
                                            </span>
                                        </span>
                                    </span>
                                    {profileCount > 0 ? (
                                        <span
                                            className={clsx(
                                                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                                                active
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-200 text-base-content/70",
                                            )}
                                        >
                                            {profileCount}
                                        </span>
                                    ) : (
                                        <span
                                            className={clsx(
                                                "size-2 shrink-0 rounded-full transition-colors",
                                                active
                                                    ? "bg-primary"
                                                    : "bg-transparent group-hover:bg-base-content/20",
                                            )}
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col border-b border-base-content/8 lg:border-r lg:border-b-0">
                <div className="shrink-0 space-y-3 border-b border-base-content/8 px-4 pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                                Menus — {systemScopeLabel(system)}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-base-content/45">
                                Identifique o perfil e escolha os menus
                            </p>
                        </div>
                        {allowMultipleDrafts ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                leftIcon={<Plus className="size-3.5" />}
                                onClick={onAddDraft}
                            >
                                Perfil
                            </Button>
                        ) : null}
                    </div>

                    {allowMultipleDrafts && draftsForSystem.length > 0 ? (
                        <ul className="flex flex-wrap gap-1.5">
                            {draftsForSystem.map((draft, index) => {
                                const active = draft.clientId === activeDraft?.clientId;
                                const label = draft.name.trim() || `Perfil ${index + 1}`;
                                return (
                                    <li key={draft.clientId} className="flex items-center gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => onSelectDraft(draft.clientId)}
                                            className={clsx(
                                                "max-w-[10rem] truncate rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                                                active
                                                    ? "border-primary/40 bg-primary/10 text-primary"
                                                    : "border-base-content/10 bg-base-100 text-base-content/70 hover:border-base-content/20",
                                            )}
                                            title={label}
                                        >
                                            {label}
                                        </button>
                                        {draftsForSystem.length > 1 ? (
                                            <button
                                                type="button"
                                                aria-label={`Remover ${label}`}
                                                onClick={() => onRemoveDraft(draft.clientId)}
                                                className="rounded-md p-1 text-base-content/35 hover:bg-error/10 hover:text-error"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : null}

                    {activeDraft ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <InputString
                                label="Nome do perfil"
                                value={name}
                                onValueChange={onNameChange}
                                required
                                disabled={readOnly}
                                wrapperClassName="min-w-0"
                            />
                            <InputString
                                label="Descrição"
                                value={description}
                                onValueChange={onDescriptionChange}
                                disabled={readOnly}
                                wrapperClassName="min-w-0"
                            />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-base-content/15 px-3 py-4 text-center">
                            <p className="text-sm text-base-content/55">
                                Nenhum perfil neste sistema.
                            </p>
                            {allowMultipleDrafts ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    leftIcon={<Plus className="size-3.5" />}
                                    onClick={onAddDraft}
                                >
                                    Adicionar perfil
                                </Button>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {activeDraft ? (
                        <>
                            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-base-content/8 px-3 py-2">
                                <p className="text-[11px] text-base-content/45">
                                    {readOnly
                                        ? "Perfil administrativo: acesso total ao sistema (somente visualização)"
                                        : "Marque o menu para liberar todas as permissões"}
                                </p>
                                {!readOnly ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onSelectAllMenus}
                                    >
                                        {allMenusAccessState === "checked" ? "Remover todos" : "Adicionar todos"}
                                    </Button>
                                ) : null}
                            </div>
                            <NavRouteTree
                                sections={navSections}
                                selectedRouteId={selectedRoute?.id ?? null}
                                markedRouteIds={markedRouteIds}
                                showAccessCheckbox
                                accessCheckboxesReadOnly={readOnly}
                                routeAccessStateById={routeAccessStateById}
                                onRouteAccessToggle={readOnly ? undefined : onRouteAccessToggle}
                                onRouteSelect={onRouteSelect}
                                embedded
                            />
                        </>
                    ) : (
                        <p className="px-3 pt-3 text-xs text-base-content/40">
                            Adicione um perfil para configurar menus e permissões.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col">
                <div className="shrink-0 px-4 pt-3 pb-2">
                    <h3 className="truncate text-xs font-semibold tracking-wide text-base-content/70 uppercase">
                        Ações
                    </h3>
                    <p className="mt-0.5 text-[11px] text-base-content/45">
                        Marque as ações liberadas neste menu
                    </p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {activeDraft ? (
                        <ProfilePermissionPanel
                            menuLabel={selectedRoute?.label ?? null}
                            permissions={permissions}
                            selectedIds={selectedPermissionIds}
                            onToggle={onTogglePermission}
                            loading={permissionsLoading}
                            readOnly={readOnly}
                        />
                    ) : (
                        <p className="px-4 pt-2 text-xs text-base-content/40">
                            Selecione ou adicione um perfil para liberar permissões.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
