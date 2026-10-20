"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {type SubmitEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {
    collectPermissionLeafRoutes,
    collectPermissionLeafRoutesFromSections,
    findFirstPermissionRoute,
    getPermissionNavSections,
    resolvePermissionModules,
    resolvePermissionModulesForRouteTree,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {ProfilePermissionAssignmentPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionAssignmentPanel";
import {isSensitivePermissionAuthority} from "@/modules/cfg/settings/profile/components/ProfilePermissionPanel";
import {SensitivePermissionJustificationDialog} from "@/modules/cfg/settings/profile/components/SensitivePermissionJustificationDialog";
import type {ProfileCreateDto, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {useProfileScopeAccess} from "@/modules/cfg/settings/profile/hooks/useProfileScopeAccess";
import {clearProfileFormDraft, createEmptyProfileDraft, type ProfileDraftItem, readProfileFormDraft, writeProfileFormDraft} from "@/modules/cfg/settings/profile/lib/profile-form-draft";
import {filterNavSectionsByPermission} from "@/modules/cfg/settings/profile/lib/profile-scope-access";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {permissionCatalogService} from "@/modules/cfg/settings/profile/services/permission-catalog.service";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {hasPermission} from "@/shared/auth/permissions";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useCrudFormDirty} from "@/shared/components/crud/useCrudFormDirty";
import {useFormDirtyByComparison} from "@/shared/components/crud/useFormDirtyByComparison";
import {Button} from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
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

/** Sobreviave a remount (Strict Mode) — evita toast duplicado do mesmo rascunho. */
const shownProfileDraftRestoreToasts = new Set<string>();

export function ProfileFormClient() {
    const {editingId, isEditing, goToList, showSavedRecord, startCreate, cancelAndClose} = useCrudScreen();
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
    const [pendingSensitivePermissionId, setPendingSensitivePermissionId] = useState<string | null>(null);

    /** Quem gerencia perfis (role:write) ve a arvore completa; senao só o que pode acessar. */
    const permissionSectionsFor = useCallback(
        (scope: SystemScope) => {
            const sections = getPermissionNavSections(scope);
            const canManageProfiles = unrestricted || hasPermission(granted, "role:write");
            return filterNavSectionsByPermission(sections, granted, canManageProfiles);
        },
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
        if (!activeDraft?.selectedRouteId) return null;
        return findRouteById(navSections, activeDraft.selectedRouteId);
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

    const isSystemAdminProfile = isEditing && detailQuery.data?.roleType === "ADMIN";

    const allCatalogPermissionIds = useMemo(
        () => collectCatalogPermissionIds(systemCatalogQuery.data),
        [systemCatalogQuery.data],
    );

    const selectedPermissionIds = useMemo(() => {
        // ADMIN: acesso total dinamico — UI mostra o catalogo inteiro marcado.
        if (isSystemAdminProfile) {
            return new Set(allCatalogPermissionIds);
        }
        return new Set(activeDraft?.permissionIds ?? []);
    }, [activeDraft?.permissionIds, allCatalogPermissionIds, isSystemAdminProfile]);

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
            const toastKey = `create:${tenantSlug}:${username}`;
            if (!shownProfileDraftRestoreToasts.has(toastKey)) {
                shownProfileDraftRestoreToasts.add(toastKey);
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
            const toastKey = `edit:${tenantSlug}:${username}:${detailQuery.data.id}`;
            if (!shownProfileDraftRestoreToasts.has(toastKey)) {
                shownProfileDraftRestoreToasts.add(toastKey);
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
        onSuccess: async (result) => {
            clearProfileFormDraft(tenantSlug, username, draftMode, editingId);
            shownProfileDraftRestoreToasts.delete(
                isEditing
                    ? `edit:${tenantSlug}:${username}:${editingId}`
                    : `create:${tenantSlug}:${username}`,
            );
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success(
                isEditing
                    ? "Perfil atualizado"
                    : drafts.filter((draft) => draft.name.trim()).length > 1
                      ? "Perfis cadastrados"
                      : "Perfil cadastrado",
            );
            const saved = Array.isArray(result) ? result[0] : result;
            if (saved) void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível salvar o perfil."});
            setError(ex.displayMessage);
        },
    });

    const updateActiveDraft = useCallback(
        (patch: Partial<ProfileDraftItem>) => {
            if (!activeClientId) return;
            setDrafts((prev) =>
                prev.map((draft) => (draft.clientId === activeClientId ? {...draft, ...patch} : draft)),
            );
        },
        [activeClientId],
    );

    const routeAccessCtxRef = useRef({
        activeClientId,
        permissionIds: activeDraft?.permissionIds ?? ([] as string[]),
        routeAccessStateById,
        catalog: systemCatalogQuery.data,
    });
    routeAccessCtxRef.current = {
        activeClientId,
        permissionIds: activeDraft?.permissionIds ?? [],
        routeAccessStateById,
        catalog: systemCatalogQuery.data,
    };

    const handleRouteSelect = useCallback((route: AppRoute) => {
        const clientId = routeAccessCtxRef.current.activeClientId;
        if (!clientId) return;
        setDrafts((prev) =>
            prev.map((draft) => {
                if (draft.clientId !== clientId) return draft;
                const nextId = draft.selectedRouteId === route.id ? null : route.id;
                return {...draft, selectedRouteId: nextId};
            }),
        );
    }, []);

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

    const applyPermissionToggle = (permissionId: string, checked: boolean, justification?: string) => {
        if (!activeDraft) return;
        const current = new Set(activeDraft.permissionIds);
        const justifications = {...(activeDraft.sensitiveJustifications ?? {})};
        if (checked) {
            current.add(permissionId);
            if (justification?.trim()) {
                justifications[permissionId] = justification.trim();
            }
        } else {
            current.delete(permissionId);
            delete justifications[permissionId];
        }
        updateActiveDraft({
            permissionIds: Array.from(current),
            sensitiveJustifications: justifications,
        });
    };

    const togglePermission = (permissionId: string, checked: boolean) => {
        if (!activeDraft) return;
        const permission = modulePermissions.find((item) => item.id === permissionId);
        if (checked && permission && isSensitivePermissionAuthority(permission.authority)) {
            setPendingSensitivePermissionId(permissionId);
            return;
        }
        applyPermissionToggle(permissionId, checked);
    };

    const handleSensitiveJustificationConfirm = (justification: string) => {
        if (!pendingSensitivePermissionId) return;
        applyPermissionToggle(pendingSensitivePermissionId, true, justification);
        setPendingSensitivePermissionId(null);
    };

    const catalogPermissionById = useMemo(() => {
        const map = new Map<string, {id: string; authority: string}>();
        for (const group of systemCatalogQuery.data ?? []) {
            for (const permission of group.permissions) {
                map.set(permission.id, permission);
            }
        }
        return map;
    }, [systemCatalogQuery.data]);

    const handleRouteAccessToggle = useCallback((route: AppRoute) => {
        const ctx = routeAccessCtxRef.current;
        if (!ctx.activeClientId) return;
        const modules = resolvePermissionModulesForRouteTree(route);
        const catalogIds = permissionIdsForModules(modules, ctx.catalog);
        if (catalogIds.length === 0) {
            setDrafts((prev) =>
                prev.map((draft) =>
                    draft.clientId === ctx.activeClientId
                        ? {...draft, selectedRouteId: route.id}
                        : draft,
                ),
            );
            return;
        }
        const accessState = ctx.routeAccessStateById.get(route.id) ?? "unchecked";
        const current = new Set(ctx.permissionIds);
        let skippedSensitive = 0;
        // unchecked → marca tudo (exceto sensíveis novas); checked/indeterminate → limpa.
        if (accessState === "unchecked") {
            for (const id of catalogIds) {
                if (current.has(id)) continue;
                const authority = catalogPermissionById.get(id)?.authority;
                if (authority && isSensitivePermissionAuthority(authority)) {
                    skippedSensitive += 1;
                    continue;
                }
                current.add(id);
            }
        } else {
            for (const id of catalogIds) current.delete(id);
        }
        const leaf = collectPermissionLeafRoutes([route])[0];
        setDrafts((prev) =>
            prev.map((draft) => {
                if (draft.clientId !== ctx.activeClientId) return draft;
                const justifications = {...(draft.sensitiveJustifications ?? {})};
                if (accessState !== "unchecked") {
                    for (const id of catalogIds) delete justifications[id];
                }
                return {
                    ...draft,
                    permissionIds: Array.from(current),
                    sensitiveJustifications: justifications,
                    selectedRouteId: leaf?.id ?? route.id,
                };
            }),
        );
        if (skippedSensitive > 0) {
            toast.message(
                "Permissões sensíveis precisam de justificativa — marque-as individualmente na coluna Sensível.",
            );
        }
    }, [catalogPermissionById]);

    const handleSelectAllMenus = () => {
        if (!activeDraft) return;
        if (allMenusAccessState === "checked") {
            updateActiveDraft({permissionIds: [], sensitiveJustifications: {}});
            return;
        }
        const firstLeaf = collectPermissionLeafRoutesFromSections(navSections)[0];
        const current = new Set(activeDraft.permissionIds);
        let skippedSensitive = 0;
        for (const id of allCatalogPermissionIds) {
            if (current.has(id)) continue;
            const authority = catalogPermissionById.get(id)?.authority;
            if (authority && isSensitivePermissionAuthority(authority)) {
                skippedSensitive += 1;
                continue;
            }
            current.add(id);
        }
        updateActiveDraft({
            permissionIds: Array.from(current),
            selectedRouteId: firstLeaf?.id ?? activeDraft.selectedRouteId,
        });
        if (skippedSensitive > 0) {
            toast.message(
                "Permissões sensíveis precisam de justificativa — marque-as individualmente na coluna Sensível.",
            );
        }
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
        shownProfileDraftRestoreToasts.delete(`create:${tenantSlug}:${username}`);
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
            .map((draft) => {
                const justifications: Record<string, string> = {};
                for (const [permissionId, reason] of Object.entries(draft.sensitiveJustifications ?? {})) {
                    if (draft.permissionIds.includes(permissionId) && reason.trim()) {
                        justifications[permissionId] = reason.trim();
                    }
                }
                return {
                    name: draft.name.trim(),
                    description: draft.description.trim() || undefined,
                    system: draft.system,
                    permissionIds: draft.permissionIds,
                    ...(Object.keys(justifications).length > 0
                        ? {sensitivePermissionJustifications: justifications}
                        : {}),
                };
            })
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
            <SkeletonStack count={4} padded />
        );
    }

    return (
        <>
        <CrudFormShell
            onSubmit={handleSubmit}
            bodyClassName="!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0"
            footer={
                isSystemAdminProfile ? (
                    <>
                        <Button type="button" variant="ghost" onClick={handleCancel}>
                            Voltar
                        </Button>
                        <Button type="button" variant="warning" onClick={() => void cancelAndClose()}>
                            Cancelar e Fechar
                        </Button>
                    </>
                ) : (
                    <>
                        <Button type="button" variant="ghost" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="warning" onClick={() => void cancelAndClose()}>
                            Cancelar e Fechar
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
                )
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
                    markedRouteIds={undefined}
                    routeAccessStateById={routeAccessStateById}
                    onRouteAccessToggle={handleRouteAccessToggle}
                    onSelectAllMenus={handleSelectAllMenus}
                    allMenusAccessState={allMenusAccessState}
                    onRouteSelect={handleRouteSelect}
                    permissions={modulePermissions}
                    selectedPermissionIds={selectedPermissionIds}
                    onTogglePermission={togglePermission}
                    permissionsLoading={modulePermissionsQuery.isLoading}
                    readOnly={isSystemAdminProfile}
                />
            </FormSection>
            {error ? <p className="shrink-0 px-5 py-3 text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
            <SensitivePermissionJustificationDialog
                open={pendingSensitivePermissionId != null}
                onClose={() => setPendingSensitivePermissionId(null)}
                onConfirm={handleSensitiveJustificationConfirm}
            />
        </>
    );
}
