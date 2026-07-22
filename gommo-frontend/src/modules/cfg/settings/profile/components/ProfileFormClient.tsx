"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {
    collectMarkedRouteIds,
    findFirstPermissionRoute,
    getPermissionNavSections,
    resolvePermissionModule,
    systemEnumFromScope,
} from "@/modules/cfg/settings/lib/access-menu-catalog";
import {ProfilePermissionAssignmentPanel} from "@/modules/cfg/settings/profile/components/ProfilePermissionAssignmentPanel";
import type {ProfileCreateDto, SystemScope} from "@/modules/cfg/settings/profile/dto/profile.dto";
import {profileKeys} from "@/modules/cfg/settings/profile/profile.query";
import {permissionCatalogService} from "@/modules/cfg/settings/profile/services/permission-catalog.service";
import {profileService} from "@/modules/cfg/settings/profile/services/profile.service";
import type {AppRoute} from "@/modules/root/enum/ModuleEnum";
import {SystemEnum} from "@/modules/root/enum/SystemEnum";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    {id: "identificacao", label: "Identificação"},
    {id: "permissoes", label: "Permissões"},
];

export function ProfileFormClient() {
    const {editingId, isEditing, goToList} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ProfileCreateDto>({
        name: "",
        description: "",
        system: "DP",
        permissionIds: [],
    });
    const [selectedRoute, setSelectedRoute] = useState<AppRoute | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navSections = useMemo(() => getPermissionNavSections(systemEnumFromScope(form.system)), [form.system]);
    const selectedPermissionModule = selectedRoute ? resolvePermissionModule(selectedRoute) : null;
    const detailQuery = useQuery({
        queryKey: profileKeys.detail(editingId ?? ""),
        queryFn: () => profileService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const modulePermissionsQuery = useQuery({
        queryKey: ["permission-catalog", form.system, selectedPermissionModule],
        queryFn: () => permissionCatalogService.getBySystem(form.system, selectedPermissionModule!),
        enabled: Boolean(selectedPermissionModule),
    });
    const fullCatalogQuery = useQuery({
        queryKey: ["permission-catalog", form.system, "all"],
        queryFn: () => permissionCatalogService.getBySystem(form.system),
    });
    const selectedPermissionIds = useMemo(() => new Set(form.permissionIds), [form.permissionIds]);
    const markedRouteIds = useMemo(() => {
        const groups = fullCatalogQuery.data ?? [];
        const markedModules = new Set<string>();
        for (const group of groups) {
            if (group.permissions.some((permission) => selectedPermissionIds.has(permission.id))) {
                markedModules.add(group.module);
            }
        }
        return collectMarkedRouteIds(navSections, markedModules);
    }, [fullCatalogQuery.data, navSections, selectedPermissionIds]);
    const modulePermissions = useMemo(() => {
        const groups = modulePermissionsQuery.data ?? [];
        return groups.flatMap((group) => group.permissions);
    }, [modulePermissionsQuery.data]);

    useEffect(() => {
        if (!isEditing) {
            setForm({name: "", description: "", system: "DP", permissionIds: []});
            setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections(SystemEnum.DP)));
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm({
                name: detailQuery.data.name,
                description: detailQuery.data.description ?? "",
                system: detailQuery.data.system,
                permissionIds: detailQuery.data.permissions?.map((p) => p.id) ?? [],
            });
            setSelectedRoute(
                findFirstPermissionRoute(getPermissionNavSections(systemEnumFromScope(detailQuery.data.system))),
            );
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    useEffect(() => {
        if (!selectedRoute && navSections.length > 0) {
            setSelectedRoute(findFirstPermissionRoute(navSections));
        }
    }, [navSections, selectedRoute]);

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
        setForm((prev) => {
            const set = new Set(prev.permissionIds);
            if (checked) set.add(permissionId);
            else set.delete(permissionId);
            return {...prev, permissionIds: Array.from(set)};
        });
    };
    const handleSystemChange = (system: SystemScope) => {
        if (system === form.system) return;
        setForm((prev) => ({...prev, system, permissionIds: []}));
        setSelectedRoute(findFirstPermissionRoute(getPermissionNavSections(systemEnumFromScope(system))));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
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
                        value={form.name}
                        onValueChange={(value) => setForm((prev) => ({...prev, name: value}))}
                        required
                        wrapperClassName="min-w-0"
                    />
                    <InputString
                        label="Descrição"
                        value={form.description ?? ""}
                        onValueChange={(value) => setForm((prev) => ({...prev, description: value}))}
                        wrapperClassName="min-w-0"
                    />
                </div>
            </FormSection>
            <FormSection id="permissoes" title="Permissões por sistema" bodyClassName="!p-0 !gap-0">
                <ProfilePermissionAssignmentPanel
                    system={form.system}
                    onSystemChange={handleSystemChange}
                    navSections={navSections}
                    selectedRoute={selectedRoute}
                    markedRouteIds={markedRouteIds}
                    onRouteSelect={setSelectedRoute}
                    permissions={modulePermissions}
                    selectedPermissionIds={selectedPermissionIds}
                    onTogglePermission={togglePermission}
                    permissionsLoading={modulePermissionsQuery.isLoading}
                    selectedPermissionCount={form.permissionIds.length}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
