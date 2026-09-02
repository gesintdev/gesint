"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {type SubmitEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {
    collectMarkedRouteIds,
    collectPermissionLeafRoutes,
    collectPermissionLeafRoutesFromSections,
    findFirstPermissionRoute,
    getPermissionNavSections,
    resolvePermissionModules,
    resolvePermissionModulesForRouteTree,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {ProfilePermissionAssignmentPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionAssignmentPanel";
import type {ProfileCreateDto, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {useProfileScopeAccess} from "@/modules/cfg/settings/profile/hooks/useProfileScopeAccess";
import {clearProfileFormDraft, createEmptyProfileDraft, type ProfileDraftItem, readProfileFormDraft, writeProfileFormDraft} from "@/modules/cfg/settings/profile/lib/profile-form-draft";
import {filterNavSectionsByPermission} from "@/modules/cfg/settings/profile/lib/profile-scope-access";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {permissionCatalogService} from "@/modules/cfg/settings/profile/services/permission-catalog.service";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useCrudFormDirty} from "@/shared/components/crud/useCrudFormDirty";
import {useFormDirtyByComparison} from "@/shared/components/crud/useFormDirtyByComparison";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type CheckboxState, resolveCheckboxState} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";
import {useBranchScopedQueryKey} from "@/shared/hooks/useBranchScopedQueryKey";

function findRouteById(sections: NavSection[], routeId?: string | null): AppRoute | null {
    if (!routeId) return null;
    const walk = (routes: AppRoute[]): AppRoute | null => {
        for (const route of routes) {
            if (route.id === routeId) return route;
            if (route.children?.length) {
                const nested = walk(route.children);
                if (nested) return nested;
            }
        }
        return null;
    };
    for (const section of sections) {
        const found = walk(section.routes);
        if (found) return found;
    }
    return null;
}

function collectCatalogPermissionIds(
    groups: Array<{module: string; permissions: Array<{id: string}>}> | undefined,
): string[] {
    if (!groups?.length) return [];
    return groups.flatMap((group) => group.permissions.map((permission) => permission.id));
}

function permissionIdsForModules(
    modules: string[],
    groups: Array<{module: string; permissions: Array<{id: string}>}> | undefined,
): string[] {
    if (!groups?.length || modules.length === 0) return [];
    const moduleSet = new Set(modules);
    return groups
        .filter((group) => moduleSet.has(group.module))
        .flatMap((group) => group.permissions.map((permission) => permission.id));
}

function draftHasContent(draft: ProfileDraftItem): boolean {
    return Boolean(draft.name.trim()) || draft.permissionIds.length > 0 || Boolean(draft.description.trim());
}

type ProfileDirtySnapshot = {
    drafts: Array<{
        system: SystemScope;
        name: string;
        description: string;
        permissionIds: string[];
    }>;
};

function toProfileDirtySnapshot(drafts: ProfileDraftItem[]): ProfileDirtySnapshot {
    return {
        drafts: drafts.map(({system, name, description, permissionIds}) => ({
            system,
            name,
            description,
            permissionIds: [...permissionIds].sort(),
        })),
    };
}

export function ProfileFormClient() {
    const {editingId, isEditing, goToList, returnToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const {data: session} = useSession();
    const tenantSlug = session?.tenantSlug?.trim() || "default";
    const username = session?.user?.username?.trim() || session?.user?.email?.trim() || "anonymous";

    const {scopes: allowedSystems, granted, unrestricted, ready: scopeReady} = useProfileScopeAccess();
    const defaultSystem = allowedSystems[0] ?? "CFG";

    const [activeSystem, setActiveSystem] = useState<SystemScope>("CFG");
    const [drafts, setDrafts] = useState<ProfileDraftItem[]>([]);
    const [activeClientId, setActiveClientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hydratedDetailId, setHydratedDetailId] = useState<string | null>(null);
    const [draftBootstrapped, setDraftBootstrapped] = useState(false);
    const [profileBaseline, setProfileBaseline] = useState<ProfileDirtySnapshot | null>(null);
    const restoredToastShown = useRef(false);

    /** Menus do sistema limitados ao que o usuario logado pode acessar. */
    const permissionSectionsFor = useCallback(
        (scope: SystemScope) =>
            filterNavSectionsByPermission(getPermissionNavSections(scope), granted, unrestricted),
        [granted, unrestricted],
    );

    const navSections = useMemo(
        () => permissionSectionsFor(activeSystem),
        [activeSystem, permissionSectionsFor],
    );
    const activeDraft = useMemo(
        () => drafts.find((draft) => draft.clientId === activeClientId) ?? null,
        [activeClientId, drafts],
    );
    const draftsForSystem = useMemo(
        () => drafts.filter((draft) => draft.system === activeSystem),
        [activeSystem, drafts],
    );
    const selectedRoute = useMemo(() => {
        if (!activeDraft) return null;
        return (
            findRouteById(navSections, activeDraft.selectedRouteId) ??
            findFirstPermissionRoute(navSections)
        );
    }, [activeDraft, navSections]);
    const selectedPermissionModules = useMemo(
        () => (selectedRoute ? resolvePermissionModules(selectedRoute) : []),
        [selectedRoute],
    );

    const detailQueryKey = useBranchScopedQueryKey(profileKeys.detail(editingId ?? ""));
    const modulePermissionsQueryKey = useBranchScopedQueryKey([
        "permission-catalog",
        activeSystem,
        selectedPermissionModules.join("|"),
    ]);
    const systemCatalogQueryKey = useBranchScopedQueryKey(["permission-catalog", activeSystem, "all"]);

    const detailQuery = useQuery({
        queryKey: detailQueryKey,
        queryFn: () => profileService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const modulePermissionsQuery = useQuery({
        queryKey: modulePermissionsQueryKey,
        queryFn: async () => {
            const groups = await Promise.all(
                selectedPermissionModules.map((module) =>
                    permissionCatalogService.getBySystem(activeSystem, module),
                ),
            );
            return groups.flat();
        },
        enabled: selectedPermissionModules.length > 0,
    });
    const systemCatalogQuery = useQuery({
        queryKey: systemCatalogQueryKey,
        queryFn: () => permissionCatalogService.getBySystem(activeSystem),
    });

    const selectedPermissionIds = useMemo(
        () => new Set(activeDraft?.permissionIds ?? []),
        [activeDraft?.permissionIds],
    );
    const markedRouteIds = useMemo(() => {
        const groups = systemCatalogQuery.data ?? [];
        const markedModules = new Set<string>();
        for (const group of groups) {
            if (group.permissions.some((permission) => selectedPermissionIds.has(permission.id))) {
                markedModules.add(group.module);
            }
        }
        return collectMarkedRouteIds(navSections, markedModules);
    }, [navSections, selectedPermissionIds, systemCatalogQuery.data]);

    const routeAccessStateById = useMemo(() => {
        const map = new Map<string, CheckboxState>();
        const groups = systemCatalogQuery.data;
        const walk = (routes: AppRoute[]) => {
            for (const route of routes) {
                const catalogIds = permissionIdsForModules(
                    resolvePermissionModulesForRouteTree(route),
                    groups,
                );
                const selectedCount = catalogIds.filter((id) => selectedPermissionIds.has(id)).length;
                map.set(route.id, resolveCheckboxState(selectedCount, catalogIds.length));
                if (route.children?.length) {
                    walk(route.children);
                }
            }
        };
        for (const section of navSections) {
            walk(section.routes);
        }
        return map;
    }, [navSections, selectedPermissionIds, systemCatalogQuery.data]);

    const allCatalogPermissionIds = useMemo(
        () => collectCatalogPermissionIds(systemCatalogQuery.data),
        [systemCatalogQuery.data],
    );
    const allMenusAccessState = useMemo(() => {
        const selectedCount = allCatalogPermissionIds.filter((id) => selectedPermissionIds.has(id)).length;
        return resolveCheckboxState(selectedCount, allCatalogPermissionIds.length);
    }, [allCatalogPermissionIds, selectedPermissionIds]);

    const modulePermissions = useMemo(() => {
        const groups = modulePermissionsQuery.data ?? [];
        return groups.flatMap((group) => group.permissions);
    }, [modulePermissionsQuery.data]);
    const systemProfileCountByScope = useMemo(() => {
        const map: Partial<Record<SystemScope, number>> = {};
        for (const draft of drafts) {
            map[draft.system] = (map[draft.system] ?? 0) + 1;
        }
        return map;
    }, [drafts]);

    const draftMode = isEditing ? "edit" : "create";

    const profileDirtySnapshot = useMemo(
        () => (draftBootstrapped ? toProfileDirtySnapshot(drafts) : null),
        [draftBootstrapped, drafts],
    );
    useCrudFormDirty(useFormDirtyByComparison(profileDirtySnapshot, profileBaseline));

    useEffect(() => {
        if (!scopeReady || allowedSystems.length === 0) return;
        if (!allowedSystems.includes(activeSystem)) {
            setActiveSystem(defaultSystem);
        }
    }, [activeSystem, allowedSystems, defaultSystem, scopeReady]);

    useEffect(() => {
        restoredToastShown.current = false;
        setDraftBootstrapped(false);
        setProfileBaseline(null);
        setHydratedDetailId(null);
        setError(null);

        if (isEditing) return;

        if (!scopeReady) return;

        const stored = readProfileFormDraft(tenantSlug, username, "create");
        // Rascunhos de sistemas nao contratados / sem acesso do usuario sao descartados.
        const storedDrafts = stored?.drafts.filter((draft) => allowedSystems.includes(draft.system)) ?? [];
        let nextDrafts: ProfileDraftItem[];
        if (storedDrafts.length > 0) {
            nextDrafts = storedDrafts;
            setDrafts(nextDrafts);
            setActiveSystem(
                allowedSystems.includes(stored!.activeSystem) ? stored!.activeSystem : defaultSystem,
            );
            setActiveClientId(
                stored?.activeClientId &&
                    storedDrafts.some((draft) => draft.clientId === stored.activeClientId)
                    ? stored.activeClientId
                    : storedDrafts[0]?.clientId ?? null,
            );
            if (!restoredToastShown.current) {
                restoredToastShown.current = true;
                toast.message("Rascunho de perfis restaurado");
            }
        } else {
            const first = createEmptyProfileDraft(
                defaultSystem,
                findFirstPermissionRoute(permissionSectionsFor(defaultSystem))?.id ?? null,
            );
            nextDrafts = [first];
            setDrafts(nextDrafts);
            setActiveSystem(defaultSystem);
            setActiveClientId(first.clientId);
        }
        setProfileBaseline(toProfileDirtySnapshot(nextDrafts));
        setDraftBootstrapped(true);
    }, [
        allowedSystems,
        defaultSystem,
        editingId,
        isEditing,
        permissionSectionsFor,
        scopeReady,
        tenantSlug,
        username,
    ]);

    useEffect(() => {
        if (!isEditing || !detailQuery.data || hydratedDetailId === detailQuery.data.id) return;

        const stored = readProfileFormDraft(tenantSlug, username, "edit", detailQuery.data.id);
        let nextDrafts: ProfileDraftItem[];
        if (stored && stored.drafts.length === 1 && stored.drafts[0]?.system === detailQuery.data.system) {
            nextDrafts = stored.drafts;
            setDrafts(nextDrafts);
            setActiveSystem(stored.activeSystem);
            setActiveClientId(stored.drafts[0].clientId);
            if (!restoredToastShown.current) {
                restoredToastShown.current = true;
                toast.message("Rascunho restaurado");
            }
        } else {
            const system = detailQuery.data.system;
            const draft: ProfileDraftItem = {
                ...createEmptyProfileDraft(
                    system,
                    findFirstPermissionRoute(permissionSectionsFor(system))?.id ?? null,
                ),
                name: detailQuery.data.name,
                description: detailQuery.data.description ?? "",
                permissionIds: detailQuery.data.permissions?.map((permission) => permission.id) ?? [],
            };
            nextDrafts = [draft];
            setDrafts(nextDrafts);
            setActiveSystem(system);
            setActiveClientId(draft.clientId);
        }
        setProfileBaseline(toProfileDirtySnapshot(nextDrafts));
        setHydratedDetailId(detailQuery.data.id);
        setDraftBootstrapped(true);
        setError(null);
    }, [detailQuery.data, hydratedDetailId, isEditing, permissionSectionsFor, tenantSlug, username]);

    useEffect(() => {
        if (!draftBootstrapped) return;
        if (isEditing && !editingId) return;

        const timer = window.setTimeout(() => {
            writeProfileFormDraft(
                tenantSlug,
                username,
                draftMode,
                {
                    activeSystem,
                    activeClientId,
                    drafts,
                },
                editingId,
            );
        }, 400);
        return () => window.clearTimeout(timer);
    }, [
        activeClientId,
        activeSystem,
        draftBootstrapped,
        draftMode,
        drafts,
        editingId,
        isEditing,
        tenantSlug,
        username,
    ]);

    useEffect(() => {
        if (!activeDraft) return;
        if (activeDraft.selectedRouteId) return;
        const first = findFirstPermissionRoute(navSections);
        if (!first) return;
        setDrafts((prev) =>
            prev.map((draft) =>
                draft.clientId === activeDraft.clientId
                    ? {...draft, selectedRouteId: first.id}
                    : draft,
            ),
        );
    }, [activeDraft, navSections]);

    const saveMutation = useMutation({
        mutationFn: async (items: ProfileCreateDto[]) => {
            if (isEditing && editingId) {
                return profileService.update(editingId, items[0]!);
            }
            const created = [];
            for (const item of items) {
                created.push(await profileService.create(item));
            }
            return created;
        },
        onSuccess: async () => {
            clearProfileFormDraft(tenantSlug, username, draftMode, editingId);
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success(
                isEditing
                    ? "Perfil atualizado"
                    : drafts.filter((draft) => draft.name.trim()).length > 1
                      ? "Perfis cadastrados"
                      : "Perfil cadastrado",
            );
            returnToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível salvar o perfil."});
            setError(ex.displayMessage);
        },
    });

    const updateActiveDraft = (patch: Partial<ProfileDraftItem>) => {
        if (!activeClientId) return;
        setDrafts((prev) =>
            prev.map((draft) => (draft.clientId === activeClientId ? {...draft, ...patch} : draft)),
        );
    };

    const handleSystemChange = (nextSystem: SystemScope) => {
        if (isEditing) return;
        if (nextSystem === activeSystem) return;
        if (!allowedSystems.includes(nextSystem)) return;
        setActiveSystem(nextSystem);
        const existing = drafts.filter((draft) => draft.system === nextSystem);
        if (existing.length > 0) {
            setActiveClientId(existing[0]!.clientId);
            return;
        }
        const created = createEmptyProfileDraft(
            nextSystem,
            findFirstPermissionRoute(permissionSectionsFor(nextSystem))?.id ?? null,
        );
        setDrafts((prev) => [...prev, created]);
        setActiveClientId(created.clientId);
    };

    const handleAddDraft = () => {
        if (isEditing) return;
        const created = createEmptyProfileDraft(
            activeSystem,
            findFirstPermissionRoute(permissionSectionsFor(activeSystem))?.id ?? null,
        );
        setDrafts((prev) => [...prev, created]);
        setActiveClientId(created.clientId);
    };

    const handleRemoveDraft = (clientId: string) => {
        if (isEditing) return;
        setDrafts((prev) => {
            const target = prev.find((draft) => draft.clientId === clientId);
            if (!target) return prev;
            const next = prev.filter((draft) => draft.clientId !== clientId);
            const remainingInSystem = next.filter((draft) => draft.system === target.system);
            if (remainingInSystem.length === 0) {
                const replacement = createEmptyProfileDraft(
                    target.system,
                    findFirstPermissionRoute(permissionSectionsFor(target.system))?.id ?? null,
                );
                setActiveClientId(replacement.clientId);
                return [...next, replacement];
            }
            if (activeClientId === clientId) {
                setActiveClientId(remainingInSystem[0]!.clientId);
            }
            return next;
        });
    };

    const togglePermission = (permissionId: string, checked: boolean) => {
        if (!activeDraft) return;
        const current = new Set(activeDraft.permissionIds);
        if (checked) current.add(permissionId);
        else current.delete(permissionId);
        updateActiveDraft({permissionIds: Array.from(current)});
    };

    const handleRouteAccessToggle = (route: AppRoute) => {
        if (!activeDraft) return;
        const catalogIds = permissionIdsForModules(
            resolvePermissionModulesForRouteTree(route),
            systemCatalogQuery.data,
        );
        if (catalogIds.length === 0) {
            updateActiveDraft({selectedRouteId: route.id});
            return;
        }
        const accessState = routeAccessStateById.get(route.id) ?? "unchecked";
        const current = new Set(activeDraft.permissionIds);
        if (accessState === "checked") {
            for (const id of catalogIds) current.delete(id);
        } else {
            for (const id of catalogIds) current.add(id);
        }
        const leaf = collectPermissionLeafRoutes([route])[0];
        updateActiveDraft({
            permissionIds: Array.from(current),
            selectedRouteId: leaf?.id ?? route.id,
        });
    };

    const handleSelectAllMenus = () => {
        if (!activeDraft) return;
        if (allMenusAccessState === "checked") {
            updateActiveDraft({permissionIds: []});
            return;
        }
        const firstLeaf = collectPermissionLeafRoutesFromSections(navSections)[0];
        updateActiveDraft({
            permissionIds: allCatalogPermissionIds,
            selectedRouteId: firstLeaf?.id ?? activeDraft.selectedRouteId,
        });
    };

    const handleCancel = () => {
        clearProfileFormDraft(tenantSlug, username, draftMode, editingId);
        goToList();
    };

    const resetToEmptyCreate = () => {
        const first = createEmptyProfileDraft(
            defaultSystem,
            findFirstPermissionRoute(permissionSectionsFor(defaultSystem))?.id ?? null,
        );
        const nextDrafts = [first];
        setDrafts(nextDrafts);
        setActiveSystem(defaultSystem);
        setActiveClientId(first.clientId);
        setProfileBaseline(toProfileDirtySnapshot(nextDrafts));
        setError(null);
        setHydratedDetailId(null);
        setDraftBootstrapped(true);
        restoredToastShown.current = false;
    };

    const handleNewCadastro = () => {
        clearProfileFormDraft(tenantSlug, username, draftMode, editingId);
        clearProfileFormDraft(tenantSlug, username, "create");
        if (isEditing) {
            startCreate();
            return;
        }
        resetToEmptyCreate();
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const toSave = (isEditing ? drafts : drafts.filter(draftHasContent))
            .map((draft) => ({
                name: draft.name.trim(),
                description: draft.description.trim() || undefined,
                system: draft.system,
                permissionIds: draft.permissionIds,
            }))
            .filter((draft) => draft.name.length > 0);

        if (toSave.length === 0) {
            setError("Informe o nome de pelo menos um perfil.");
            return;
        }

        const seen = new Set<string>();
        for (const item of toSave) {
            const key = `${item.system}::${item.name.toLowerCase()}`;
            if (seen.has(key)) {
                setError(`Há nomes duplicados no sistema ${item.system}.`);
                return;
            }
            seen.add(key);
        }

        saveMutation.mutate(toSave);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="outline" onClick={handleNewCadastro}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" variant="primary" loading={saveMutation.isPending}>
                        {isEditing
                            ? "Salvar perfil"
                            : drafts.filter((draft) => draft.name.trim()).length > 1
                              ? "Salvar perfis"
                              : "Salvar perfil"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="permissoes"
                title="Perfis por sistema"
                className="flex min-h-0 flex-1 flex-col overflow-hidden !rounded-none !border-0 !shadow-none"
                bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0 !gap-0"
            >
                <ProfilePermissionAssignmentPanel
                    system={activeSystem}
                    availableSystems={allowedSystems}
                    onSystemChange={handleSystemChange}
                    systemProfileCountByScope={systemProfileCountByScope}
                    systemsLocked={isEditing}
                    draftsForSystem={draftsForSystem}
                    activeDraft={activeDraft}
                    onSelectDraft={setActiveClientId}
                    onAddDraft={handleAddDraft}
                    onRemoveDraft={handleRemoveDraft}
                    allowMultipleDrafts={!isEditing}
                    name={activeDraft?.name ?? ""}
                    description={activeDraft?.description ?? ""}
                    onNameChange={(value) => updateActiveDraft({name: value})}
                    onDescriptionChange={(value) => updateActiveDraft({description: value})}
                    navSections={navSections}
                    selectedRoute={selectedRoute}
                    markedRouteIds={markedRouteIds}
                    routeAccessStateById={routeAccessStateById}
                    onRouteAccessToggle={handleRouteAccessToggle}
                    onSelectAllMenus={handleSelectAllMenus}
                    allMenusAccessState={allMenusAccessState}
                    onRouteSelect={(route) => updateActiveDraft({selectedRouteId: route.id})}
                    permissions={modulePermissions}
                    selectedPermissionIds={selectedPermissionIds}
                    onTogglePermission={togglePermission}
                    permissionsLoading={modulePermissionsQuery.isLoading}
                />
            </FormSection>
            {error ? <p className="shrink-0 px-5 py-3 text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
