"use client";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import {
    collectMarkedRouteIds,
    findFirstPermissionRoute,
    getPermissionNavSections,
    resolvePermissionModule,
    systemEnumFromScope,
} from "@/modules/settings/lib/access-menu-catalog";
import { ProfilePermissionPanel } from "@/modules/settings/profile/components/ProfilePermissionPanel";
import type { ProfileCreateDto, SystemScope } from "@/modules/settings/profile/dto/profile.dto";
import { profileKeys } from "@/modules/settings/profile/profile.query";
import { permissionCatalogService } from "@/modules/settings/profile/services/permission-catalog.service";
import { profileService } from "@/modules/settings/profile/services/profile.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { NavRouteTree } from "@/shared/components/layout/NavRouteTree";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";

const SYSTEM_ITEMS: SelectItem[] = [
    { value: "DP", label: "Departamento Pessoal (DP)" },
    { value: "RH", label: "Recursos Humanos (RH)" },
    { value: "CONTABILIDADE", label: "Contabilidade (CTB)" },
];
const FORM_STEPS: FormStepNavItem[] = [
    { id: "identificacao", label: "Identificação" },
    { id: "permissoes", label: "Permissões" },
];

export function ProfileFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
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
            setForm({ name: "", description: "", system: "DP", permissionIds: [] });
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
            await queryClient.invalidateQueries({ queryKey: profileKeys.all });
            toast.success(isEditing ? "Perfil atualizado" : "Perfil cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível salvar o perfil." });
            setError(ex.displayMessage);
        },
    });
    const togglePermission = (permissionId: string, checked: boolean) => {
        setForm((prev) => {
            const set = new Set(prev.permissionIds);
            if (checked) set.add(permissionId);
            else set.delete(permissionId);
            return { ...prev, permissionIds: Array.from(set) };
        });
    };
    const handleSystemChange = (system: SystemScope) => {
        setForm((prev) => ({ ...prev, system, permissionIds: [] }));
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
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
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
                <div className="grid w-full grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3">
                    <InputString
                        label="Nome do perfil"
                        value={form.name}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                        required
                        wrapperClassName="min-w-0"
                    />
                    <InputSelect
                        label="Sistema"
                        items={SYSTEM_ITEMS}
                        value={form.system}
                        onValueChange={(value) => handleSystemChange(value as SystemScope)}
                        placeholder="Selecione o sistema"
                        wrapperClassName="min-w-0"
                    />
                    <InputString
                        label="Descrição"
                        value={form.description ?? ""}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                        wrapperClassName="min-w-0"
                    />
                </div>
            </FormSection>
            <FormSection id="permissoes" title="Permissões por menu" bodyClassName="!p-0 !gap-0">
                <div className="grid min-h-[26rem] w-full grid-cols-2 overflow-hidden sm:col-span-2">
                    <NavRouteTree
                        sections={navSections}
                        selectedRouteId={selectedRoute?.id ?? null}
                        markedRouteIds={markedRouteIds}
                        onRouteSelect={setSelectedRoute}
                        embedded
                    />
                    <div className="flex min-h-0 min-w-0 flex-col border-l border-base-content/8">
                        <ProfilePermissionPanel
                            menuLabel={selectedRoute?.label ?? null}
                            permissions={modulePermissions}
                            selectedIds={selectedPermissionIds}
                            onToggle={togglePermission}
                            loading={modulePermissionsQuery.isLoading}
                        />
                    </div>
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
