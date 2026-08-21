import { Hospital, ListChecks, Stethoscope, UserRound } from "lucide-react";

import { MEDICAL_CLINIC_CRUD_LABELS } from "@/modules/rh/person/occupational-exam/clinic/config/medical-clinic.route-labels";
import { OCCUPATIONAL_EXAM_CRUD_LABELS } from "@/modules/rh/person/occupational-exam/config/occupational-exam.route-labels";
import { EXAM_REQUIREMENT_CRUD_LABELS } from "@/modules/rh/person/occupational-exam/exam-requirement/config/exam-requirement.route-labels";
import { OCCUPATIONAL_PHYSICIAN_CRUD_LABELS } from "@/modules/rh/person/occupational-exam/physician/config/occupational-physician.route-labels";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";

export const occupationalExamSharedRouteGroup: AppRoute = routeGroup({
    id: "occupational-exam-group",
    // "Exames" e nao "Exames ocupacionais": o grupo ja tem um filho chamado
    // "Exames Ocupacionais", e o nome repetido confundia lista e menu.
    label: "Exames",
    icon: Stethoscope,
    permission: "occupationalexam:read",
    children: [
        tabbedCrudRoute({
            id: "occupational-exam",
            href: OCCUPATIONAL_EXAM_CRUD_LABELS.href,
            label: OCCUPATIONAL_EXAM_CRUD_LABELS.routeLabel,
            icon: Stethoscope,
            permission: "occupationalexam:read",
            routeId: OCCUPATIONAL_EXAM_CRUD_LABELS.routeId,
            tabShortLabel: OCCUPATIONAL_EXAM_CRUD_LABELS.tabShortLabel,
            listToolbar: OCCUPATIONAL_EXAM_CRUD_LABELS.listToolbar,
            list: lazyNamed(
                () => import("@/modules/rh/person/occupational-exam/components/OccupationalExamListClient"),
                "OccupationalExamListClient",
            ),
            form: lazyNamed(
                () => import("@/modules/rh/person/occupational-exam/components/OccupationalExamFormClient"),
                "OccupationalExamFormClient",
            ),
            formTabLabel: OCCUPATIONAL_EXAM_CRUD_LABELS.formTabLabel,
            listToFormLabel: OCCUPATIONAL_EXAM_CRUD_LABELS.listToFormLabel,
            showListToFormButton: true,
        }),
        tabbedCrudRoute({
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
                () =>
                    import(
                        "@/modules/rh/person/occupational-exam/clinic/components/MedicalClinicListClient"
                    ),
                "MedicalClinicListClient",
            ),
            form: lazyNamed(
                () =>
                    import(
                        "@/modules/rh/person/occupational-exam/clinic/components/MedicalClinicFormClient"
                    ),
                "MedicalClinicFormClient",
            ),
            formTabLabel: MEDICAL_CLINIC_CRUD_LABELS.formTabLabel,
            listToFormLabel: MEDICAL_CLINIC_CRUD_LABELS.listToFormLabel,
            showListToFormButton: true,
        }),
        tabbedCrudRoute({
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
                        "@/modules/rh/person/occupational-exam/physician/components/OccupationalPhysicianListClient"
                    ),
                "OccupationalPhysicianListClient",
            ),
            form: lazyNamed(
                () =>
                    import(
                        "@/modules/rh/person/occupational-exam/physician/components/OccupationalPhysicianFormClient"
                    ),
                "OccupationalPhysicianFormClient",
            ),
            formTabLabel: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.formTabLabel,
            listToFormLabel: OCCUPATIONAL_PHYSICIAN_CRUD_LABELS.listToFormLabel,
            showListToFormButton: true,
        }),
        tabbedCrudRoute({
            id: "exam-requirement",
            href: EXAM_REQUIREMENT_CRUD_LABELS.href,
            label: EXAM_REQUIREMENT_CRUD_LABELS.routeLabel,
            icon: ListChecks,
            permission: "occupationalexam:read",
            routeId: EXAM_REQUIREMENT_CRUD_LABELS.routeId,
            tabShortLabel: EXAM_REQUIREMENT_CRUD_LABELS.tabShortLabel,
            listToolbar: EXAM_REQUIREMENT_CRUD_LABELS.listToolbar,
            list: lazyNamed(
                () =>
                    import(
                        "@/modules/rh/person/occupational-exam/exam-requirement/components/ExamRequirementListClient"
                    ),
                "ExamRequirementListClient",
            ),
            form: lazyNamed(
                () =>
                    import(
                        "@/modules/rh/person/occupational-exam/exam-requirement/components/ExamRequirementFormClient"
                    ),
                "ExamRequirementFormClient",
            ),
            formTabLabel: EXAM_REQUIREMENT_CRUD_LABELS.formTabLabel,
            listToFormLabel: EXAM_REQUIREMENT_CRUD_LABELS.listToFormLabel,
            showListToFormButton: true,
        }),
    ],
});
