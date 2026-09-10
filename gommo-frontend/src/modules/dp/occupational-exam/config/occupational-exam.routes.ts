import { Hospital, UserRound } from "lucide-react";

import { MEDICAL_CLINIC_CRUD_LABELS } from "@/modules/dp/occupational-exam/clinic/config/medical-clinic.route-labels";
import { OCCUPATIONAL_PHYSICIAN_CRUD_LABELS } from "@/modules/dp/occupational-exam/physician/config/occupational-physician.route-labels";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, tabbedCrudRoute } from "@/shared/routing";

/** Cadastros de clinica/medico — registrados em Organizacao (abaixo de Cargos). */
export const medicalClinicCrudRoute: AppRoute = tabbedCrudRoute({
    id: "medical-clinic",
    href: MEDICAL_CLINIC_CRUD_LABELS.href,
    label: MEDICAL_CLINIC_CRUD_LABELS.routeLabel,
    icon: Hospital,
    permission: "occupationalexam:read",
    routeId: MEDICAL_CLINIC_CRUD_LABELS.routeId,
    tabShortLabel: MEDICAL_CLINIC_CRUD_LABELS.tabShortLabel,
    listToolbar: MEDICAL_CLINIC_CRUD_LABELS.listToolbar,
    fieldTabName: "corporateName",
    list: lazyNamed(
        () => import("@/modules/dp/occupational-exam/clinic/components/MedicalClinicListClient"),
        "MedicalClinicListClient",
    ),
    form: lazyNamed(
        () => import("@/modules/dp/occupational-exam/clinic/components/MedicalClinicFormClient"),
        "MedicalClinicFormClient",
    ),
    formTabLabel: MEDICAL_CLINIC_CRUD_LABELS.formTabLabel,
    listToFormLabel: MEDICAL_CLINIC_CRUD_LABELS.listToFormLabel,
    showListToFormButton: true,
});

export const occupationalPhysicianCrudRoute: AppRoute = tabbedCrudRoute({
    id: "occupational-physician",
    href: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.href,
    label: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.routeLabel,
    icon: UserRound,
    permission: "occupationalexam:read",
    routeId: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.routeId,
    tabShortLabel: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.tabShortLabel,
    listToolbar: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.listToolbar,
    fieldTabName: "fullName",
    list: lazyNamed(
        () =>
            import(
                "@/modules/dp/occupational-exam/physician/components/OccupationalPhysicianListClient"
            ),
        "OccupationalPhysicianListClient",
    ),
    form: lazyNamed(
        () =>
            import(
                "@/modules/dp/occupational-exam/physician/components/OccupationalPhysicianFormClient"
            ),
        "OccupationalPhysicianFormClient",
    ),
    formTabLabel: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.formTabLabel,
    listToFormLabel: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.listToFormLabel,
    showListToFormButton: true,
});
