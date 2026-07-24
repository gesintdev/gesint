"use client";

import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {
    ASSIGNABLE_SYSTEM_SCOPES,
    collectMarkedRouteIds,
    findFirstPermissionRoute,
    getPermissionNavSections,
    resolvePermissionModules,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {ProfilePermissionAssignmentPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionAssignmentPanel";
import type {ProfileCreateDto, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {permissionCatalogService} from "@/modules/cfg/settings/profile/services/permission-catalog.service";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {type CheckboxState, InputString, resolveCheckboxState} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    {id: "identificacao", label: "Identificação"},
    {id: "permissoes", label: "Permissões"},
];

type PermissionIdsBySystem = Partial<Record<SystemScope, string[]>>;

function collectCatalogPermissionIds(
    groups: Array<{permissions: Array<{id: string}>}> | undefined,
): string[] {
    if (!groups?.length) return [];
    return groups.flatMap((group) => group.permissions.map((permission) => permission.id));
}

function emptyPermissionIdsBySystem(): PermissionIdsBySystem {
    return Object.fromEntries(ASSIGNABLE_SYSTEM_SCOPES.map((scope) => [scope, []])) as PermissionIdsBySystem;
}

function flattenPermissionIds(bySystem: PermissionIdsBySystem): string[] {
    return Array.from(new Set(ASSIGNABLE_SYSTEM_SCOPES.flatMap((scope) => bySystem[scope] ?? [])));
}

/** Reparte IDs salvos sem vazar compartilhados para outros sistemas. */
function partitionPermissionIdsBySystem(
    permissionIds: string[],
    catalogIdsBySystem: Partial<Record<SystemScope, string[]>>,
    primarySystem: SystemScope,
): PermissionIdsBySystem {
    const selected = new Set(permissionIds);
    const systemsForId = new Map<string, SystemScope[]>();
    for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
        for (const id of catalogIdsBySystem[scope] ?? []) {
            const list = systemsForId.get(id) ?? [];
            list.push(scope);
            systemsForId.set(id, list);
        }
    }

    const result = emptyPermissionIdsBySystem();
    for (const id of selected) {
        const systems = systemsForId.get(id) ?? [];
        if (systems.length === 0) {
            result[primarySystem] = [...(result[primarySystem] ?? []), id];
            continue;
        }
        if (systems.length === 1) {
            const scope = systems[0];
            result[scope] = [...(result[scope] ?? []), id];
            continue;
        }
        const target = systems.includes(primarySystem) ? primarySystem : systems[0];
        result[target] = [...(result[target] ?? []), id];
    }
    return result;
}

export function ProfileFormClient() {
    const {editingId, isEditing, goToList} = useCrudScreen();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [system, setSystem] = useState<SystemScope>("CFG");
    const [permissionIdsBySystem, setPermissionIdsBySystem] = useState<PermissionIdsBySystem>(emptyPermissionIdsBySystem);
    const [selectedRoute, setSelectedRoute] = useState<AppRoute | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingSelectAllSystem, setPendingSelectAllSystem] = useState<SystemScope | null>(null);
    const [hydratedDetailId, setHydratedDetailId] = useState<string | null>(null);
    const navSections = useMemo(() => getPermissionNavSections(system), [system]);
    const selectedPermissionModules = useMemo(
        () => (selectedRoute ? resolvePermissionModules(selectedRoute) : []),
        [selectedRoute],
    );
    const detailQuery = useQuery({
        queryKey: profileKeys.detail(editingId ?? ""),
        queryFn: () => profileService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const modulePermissionsQuery = useQuery({
        queryKey: ["permission-catalog", system, selectedPermissionModules.join("|")],
        queryFn: async () => {
            const groups = await Promise.all(
                selectedPermissionModules.map((module) => permissionCatalogService.getBySystem(system, module)),
            );
            return groups.flat();
        },
        enabled: selectedPermissionModules.length > 0,
    });
    const catalogQueries = useQueries({
        queries: ASSIGNABLE_SYSTEM_SCOPES.map((scope) => ({
            queryKey: ["permission-catalog", scope, "all"] as const,
            queryFn: () => permissionCatalogService.getBySystem(scope),
        })),
    });
    const catalogsReady = catalogQueries.every((query) => query.isSuccess);
    const catalogDataVersion = catalogQueries
        .map((query) => `${query.fetchStatus}:${query.dataUpdatedAt}`)
        .join("|");
    const catalogIdsBySystem = useMemo(() => {
        const map: Partial<Record<SystemScope, string[]>> = {};
        ASSIGNABLE_SYSTEM_SCOPES.forEach((scope, index) => {
            map[scope] = collectCatalogPermissionIds(catalogQueries[index]?.data);
        });
        return map;
        // catalogDataVersion cobre mudanças reais dos catálogos; evita nova ref a cada render do useQueries.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- version signature
    }, [catalogDataVersion]);
    const activePermissionIds = permissionIdsBySystem[system] ?? [];
    const selectedPermissionIds = useMemo(() => new Set(activePermissionIds), [activePermissionIds]);
    const activeCatalogGroups = catalogQueries[ASSIGNABLE_SYSTEM_SCOPES.indexOf(system)]?.data;
    const markedRouteIds = useMemo(() => {
        const groups = activeCatalogGroups ?? [];
        const markedModules = new Set<string>();
        for (const group of groups) {
            if (group.permissions.some((permission) => selectedPermissionIds.has(permission.id))) {
                markedModules.add(group.module);
            }
        }
        return collectMarkedRouteIds(navSections, markedModules);
    }, [activeCatalogGroups, navSections, selectedPermissionIds]);
    const modulePermissions = useMemo(() => {
        const groups = modulePermissionsQuery.data ?? [];
        return groups.flatMap((group) => group.permissions);
    }, [modulePermissionsQuery.data]);
    const systemAccessStateByScope = useMemo(() => {
        const map: Partial<Record<SystemScope, CheckboxState>> = {};
        for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
            const catalogIds = catalogIdsBySystem[scope] ?? [];
            const selectedIds = permissionIdsBySystem[scope] ?? [];
            if (catalogIds.length === 0) {
                map[scope] = selectedIds.length > 0 ? "indeterminate" : "unchecked";
                continue;
            }
            const selectedInCatalog = catalogIds.filter((id) => selectedIds.includes(id)).length;
            map[scope] = resolveCheckboxState(selectedInCatalog, catalogIds.length);
        }
        return map;
    }, [catalogIdsBySystem, permissionIdsBySystem]);
    const selectedPermissionCountByScope = useMemo(() => {
        const map: Partial<Record<SystemScope, number>> = {};
        for (const scope of ASSIGNABLE_SYSTEM_SCOPES) {
            map[scope] = (permissionIdsBySystem[scope] ?? []).length;
        }
        return map;
    }, [permissionIdsBySystem]);

    useEffect(() => {
        if (isEditing) return;
        setName("");
        setDescription("");
        setSystem("CFG");
        setPermissionIdsBySystem(emptyPermissionIdsBySystem());
        setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections("CFG")));
        setPendingSelectAllSystem(null);
        setHydratedDetailId(null);
        setError(null);
    }, [editingId, isEditing]);

    useEffect(() => {
        if (!isEditing || !detailQuery.data || !catalogsReady) return;
        if (hydratedDetailId === detailQuery.data.id) return;

        const primarySystem = detailQuery.data.system;
        setName(detailQuery.data.name);
        setDescription(detailQuery.data.description ?? "");
        setSystem(primarySystem);
        setPermissionIdsBySystem(
            partitionPermissionIdsBySystem(
                detailQuery.data.permissions?.map((p) => p.id) ?? [],
                catalogIdsBySystem,
                primarySystem,
            ),
        );
        setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections(primarySystem)));
        setPendingSelectAllSystem(null);
        setHydratedDetailId(detailQuery.data.id);
        setError(null);
    }, [catalogIdsBySystem, catalogsReady, detailQuery.data, hydratedDetailId, isEditing]);

    useEffect(() => {
        if (!selectedRoute && navSections.length > 0) {
            setSelectedRoute(findFirstPermissionRoute(navSections));
        }
    }, [navSections, selectedRoute]);

    useEffect(() => {
        if (!pendingSelectAllSystem || pendingSelectAllSystem !== system) return;
        const catalogIds = catalogIdsBySystem[pendingSelectAllSystem] ?? [];
        if (catalogIds.length === 0) return;
        setPermissionIdsBySystem((prev) => ({
            ...prev,
            [pendingSelectAllSystem]: catalogIds,
        }));
        setPendingSelectAllSystem(null);
    }, [catalogIdsBySystem, pendingSelectAllSystem, system]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ProfileCreateDto) => {
            if (isEditing && editingId) return profileService.update(editingId, dto);
            return profileService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: profileKeys.all});
            toast.success(isEditing ? "Perfil atualizado" : "Perfil cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível salvar o perfil."});
            setError(ex.displayMessage);
        },
    });
    const togglePermission = (permissionId: string, checked: boolean) => {
        setPermissionIdsBySystem((prev) => {
            const current = new Set(prev[system] ?? []);
            if (checked) current.add(permissionId);
            else current.delete(permissionId);
            return {...prev, [system]: Array.from(current)};
        });
    };
    const handleSystemChange = (nextSystem: SystemScope) => {
        if (nextSystem === system) return;
        setPendingSelectAllSystem(null);
        setSystem(nextSystem);
        setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections(nextSystem)));
    };
    const handleSystemAccessToggle = (nextSystem: SystemScope) => {
        const catalogIds = catalogIdsBySystem[nextSystem] ?? [];
        const accessState = systemAccessStateByScope[nextSystem] ?? "unchecked";

        if (nextSystem !== system) {
            setSystem(nextSystem);
            setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections(nextSystem)));
        }

        if (accessState === "checked") {
            setPermissionIdsBySystem((prev) => ({...prev, [nextSystem]: []}));
            setPendingSelectAllSystem(null);
            return;
        }

        if (catalogIds.length > 0) {
            setPermissionIdsBySystem((prev) => ({...prev, [nextSystem]: catalogIds}));
            setPendingSelectAllSystem(null);
            return;
        }

        setPendingSelectAllSystem(nextSystem);
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate({
            name,
            description,
            system,
            permissionIds: flattenPermissionIds(permissionIdsBySystem),
        });
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={saveMutation.isPending}>
                        Salvar perfil
                    </Button>
                </>
            }
        >
            <FormSection id="identificacao" title="Identificação">
                <div className="grid w-full grid-cols-1 gap-4 sm:col-span-12 sm:grid-cols-2">
                    <InputString
                        label="Nome do perfil"
                        value={name}
                        onValueChange={setName}
                        required
                        wrapperClassName="min-w-0"
                    />
                    <InputString
                        label="Descrição"
                        value={description}
                        onValueChange={setDescription}
                        wrapperClassName="min-w-0"
                    />
                </div>
            </FormSection>
            <FormSection id="permissoes" title="Permissões por sistema" bodyClassName="!p-0 !gap-0">
                <ProfilePermissionAssignmentPanel
                    system={system}
                    onSystemChange={handleSystemChange}
                    onSystemAccessToggle={handleSystemAccessToggle}
                    systemAccessStateByScope={systemAccessStateByScope}
                    navSections={navSections}
                    selectedRoute={selectedRoute}
                    markedRouteIds={markedRouteIds}
                    onRouteSelect={setSelectedRoute}
                    permissions={modulePermissions}
                    selectedPermissionIds={selectedPermissionIds}
                    onTogglePermission={togglePermission}
                    permissionsLoading={modulePermissionsQuery.isLoading}
                    selectedPermissionCount={activePermissionIds.length}
                    selectedPermissionCountByScope={selectedPermissionCountByScope}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
