"use client";

import type {ComponentType} from "react";
import {InputsPlaygroundClient} from "@/app/(system)/dev/inputs/InputsPlaygroundClient";
import {CollaboratorFormClient} from "@/modules/collaborator/components/CollaboratorFormClient";
import {CollaboratorListClient} from "@/modules/collaborator/components/CollaboratorListClient";
import {CollaboratorPeoplePrimaryAction} from "@/modules/collaborator/components/CollaboratorPeoplePrimaryAction";
import type {Collaborator} from "@/modules/collaborator/dto/collaborator.dto";
import {AdmissionHistoryListClient} from "@/modules/admission/components/AdmissionHistoryListClient";
import {AdmissionProcessFormClient} from "@/modules/admission/components/AdmissionProcessFormClient";
import {AdmissionProcessListClient} from "@/modules/admission/components/AdmissionProcessListClient";
import type {AdmissionProcess} from "@/modules/admission/dto/admission-process.dto";
import {AttendanceRecordFormClient} from "@/modules/attendance/components/AttendanceRecordFormClient";
import {AttendanceRecordListClient} from "@/modules/attendance/components/AttendanceRecordListClient";
import {BenefitPlanFormClient} from "@/modules/benefit/components/BenefitPlanFormClient";
import {BenefitPlanListClient} from "@/modules/benefit/components/BenefitPlanListClient";
import {EmploymentContractFormClient} from "@/modules/contract/components/EmploymentContractFormClient";
import {EmploymentContractListClient} from "@/modules/contract/components/EmploymentContractListClient";
import {DepartmentFormClient} from "@/modules/department/components/DepartmentFormClient";
import {DepartmentListClient} from "@/modules/department/components/DepartmentListClient";
import {ExitInterviewFormClient} from "@/modules/exitinterview/components/ExitInterviewFormClient";
import {ExitInterviewListClient} from "@/modules/exitinterview/components/ExitInterviewListClient";
import {JobPositionFormClient} from "@/modules/jobposition/components/JobPositionFormClient";
import {JobPositionListClient} from "@/modules/jobposition/components/JobPositionListClient";
import {LeaveRequestFormClient} from "@/modules/leave/components/LeaveRequestFormClient";
import {LeaveRequestListClient} from "@/modules/leave/components/LeaveRequestListClient";
import {OffboardingFormClient} from "@/modules/offboarding/components/OffboardingFormClient";
import {OffboardingListClient} from "@/modules/offboarding/components/OffboardingListClient";
import {PayrollRunFormClient} from "@/modules/payroll/components/PayrollRunFormClient";
import {PayrollRunListClient} from "@/modules/payroll/components/PayrollRunListClient";
import {PayslipFormClient} from "@/modules/payslip/components/PayslipFormClient";
import {PayslipListClient} from "@/modules/payslip/components/PayslipListClient";
import {TaxObligationFormClient} from "@/modules/tax/components/TaxObligationFormClient";
import {TaxObligationListClient} from "@/modules/tax/components/TaxObligationListClient";
import {PerformanceReviewFormClient} from "@/modules/performance/components/PerformanceReviewFormClient";
import {PerformanceReviewListClient} from "@/modules/performance/components/PerformanceReviewListClient";
import {BenefitEnrollmentFormClient} from "@/modules/benefitenrollment/components/BenefitEnrollmentFormClient";
import {BenefitEnrollmentListClient} from "@/modules/benefitenrollment/components/BenefitEnrollmentListClient";
import {TabbedCrudPage} from "@/shared/components/layout/TabbedCrudPage";
import {WorkspacePage} from "@/shared/components/layout/WorkspacePage";
import {PageTransition} from "@/shared/components/layout/PageTransition";
import {DashboardView} from "@/shared/workspace/views/DashboardView";
import {ComingSoonView} from "@/shared/workspace/views/ComingSoonView";

export type WorkspacePageEntry = {
    href: string;
    Component: ComponentType;
};

function AdmissionPage() {
    return (
        <TabbedCrudPage<AdmissionProcess>
            routeId="collaborator-admission"
            href="/collaborator/admission"
            routeLabel="Admissão"
            tabShortLabel="Adm"
            fieldTabName="fullName"
            list={<AdmissionProcessListClient/>}
            form={<AdmissionProcessFormClient/>}
        />
    );
}

function CollaboratorPeoplePage() {
    return (
        <TabbedCrudPage<Collaborator>
            routeId="collaborator-people"
            href="/collaborator/people"
            routeLabel="Pessoas"
            tabShortLabel="Pessoa"
            fieldTabName="fullName"
            editOnly
            showListToFormButton={false}
            listPrimaryAction={<CollaboratorPeoplePrimaryAction/>}
            listToolbar="Consulte e edite dados pessoais. Novos colaboradores entram somente pela admissão."
            formTabLabel="Dados pessoais"
            formTabLabelEdit="Editar pessoa"
            list={<CollaboratorListClient/>}
            form={<CollaboratorFormClient/>}
        />
    );
}

function CollaboratorHistoryPage() {
    return (
        <WorkspacePage>
            <div className="border-b px-4 py-2.5 text-[13px] text-base-content/50">
                Admissões concluídas — cada uma gera um colaborador no sistema.
            </div>
            <AdmissionHistoryListClient/>
        </WorkspacePage>
    );
}

function DevInputsPage() {
    return (
        <PageTransition>
            <InputsPlaygroundClient/>
        </PageTransition>
    );
}

export const WORKSPACE_PAGE_REGISTRY: WorkspacePageEntry[] = [
    {href: "/dashboard", Component: DashboardView},
    {href: "/dev/inputs", Component: DevInputsPage},
    {href: "/organization/departments", Component: () => (
        <TabbedCrudPage
            routeId="departments"
            href="/organization/departments"
            routeLabel="Departamentos"
            tabShortLabel="Depto"
            fieldTabName="name"
            list={<DepartmentListClient/>}
            form={<DepartmentFormClient/>}
        />
    )},
    {href: "/organization/job-positions", Component: () => (
        <TabbedCrudPage
            routeId="job-positions"
            href="/organization/job-positions"
            routeLabel="Cargos"
            tabShortLabel="Cargo"
            fieldTabName="title"
            list={<JobPositionListClient/>}
            form={<JobPositionFormClient/>}
        />
    )},
    {href: "/organization/users", Component: () => (
        <ComingSoonView
            title="Usuários internos"
            description="Cadastro de usuários da empresa com acesso ao sistema de RH."
        />
    )},
    {href: "/organization/roles", Component: () => (
        <ComingSoonView
            title="Perfis de acesso"
            description="Agrupamento de permissões por função (ex.: RH, gestor, colaborador)."
        />
    )},
    {href: "/organization/permissions", Component: () => (
        <ComingSoonView
            title="Permissões"
            description="Controle fino de ações permitidas por módulo dentro do tenant."
        />
    )},
    {href: "/collaborator/people", Component: CollaboratorPeoplePage},
    {href: "/collaborator/admission", Component: AdmissionPage},
    {href: "/collaborator/history", Component: CollaboratorHistoryPage},
    {href: "/contract", Component: () => (
        <TabbedCrudPage
            routeId="contract"
            href="/contract"
            routeLabel="Contratos"
            tabShortLabel="Cont"
            list={<EmploymentContractListClient/>}
            form={<EmploymentContractFormClient/>}
        />
    )},
    {href: "/attendance", Component: () => (
        <TabbedCrudPage
            routeId="attendance"
            href="/attendance"
            routeLabel="Ponto"
            tabShortLabel="Ponto"
            list={<AttendanceRecordListClient/>}
            form={<AttendanceRecordFormClient/>}
        />
    )},
    {href: "/leave", Component: () => (
        <TabbedCrudPage
            routeId="leave"
            href="/leave"
            routeLabel="Férias e afastamentos"
            tabShortLabel="Férias"
            list={<LeaveRequestListClient/>}
            form={<LeaveRequestFormClient/>}
        />
    )},
    {href: "/offboarding", Component: () => (
        <TabbedCrudPage
            routeId="offboarding"
            href="/offboarding"
            routeLabel="Desligamento"
            tabShortLabel="Desl"
            list={<OffboardingListClient/>}
            form={<OffboardingFormClient/>}
        />
    )},
    {href: "/exit-interview", Component: () => (
        <TabbedCrudPage
            routeId="exit-interview"
            href="/exit-interview"
            routeLabel="Entrevista de desligamento"
            tabShortLabel="Entrev"
            list={<ExitInterviewListClient/>}
            form={<ExitInterviewFormClient/>}
        />
    )},
    {href: "/payroll", Component: () => (
        <TabbedCrudPage
            routeId="payroll-run"
            href="/payroll"
            routeLabel="Processamento"
            tabShortLabel="Folha"
            list={<PayrollRunListClient/>}
            form={<PayrollRunFormClient/>}
        />
    )},
    {href: "/payroll/payslips", Component: () => (
        <TabbedCrudPage
            routeId="payslip"
            href="/payroll/payslips"
            routeLabel="Holerites"
            tabShortLabel="Hol"
            list={<PayslipListClient/>}
            form={<PayslipFormClient/>}
        />
    )},
    {href: "/benefit", Component: () => (
        <TabbedCrudPage
            routeId="benefit-plan"
            href="/benefit"
            routeLabel="Planos de benefício"
            tabShortLabel="Plano"
            fieldTabName="name"
            list={<BenefitPlanListClient/>}
            form={<BenefitPlanFormClient/>}
        />
    )},
    {href: "/benefit/enrollments", Component: () => (
        <TabbedCrudPage
            routeId="benefit-enrollment"
            href="/benefit/enrollments"
            routeLabel="Vínculos de benefício"
            tabShortLabel="Vínc"
            list={<BenefitEnrollmentListClient/>}
            form={<BenefitEnrollmentFormClient/>}
        />
    )},
    {href: "/tax", Component: () => (
        <TabbedCrudPage
            routeId="tax"
            href="/tax"
            routeLabel="Obrigações fiscais"
            tabShortLabel="Fiscal"
            list={<TaxObligationListClient/>}
            form={<TaxObligationFormClient/>}
        />
    )},
    {href: "/performance", Component: () => (
        <TabbedCrudPage
            routeId="performance"
            href="/performance"
            routeLabel="Desempenho"
            tabShortLabel="Desemp"
            list={<PerformanceReviewListClient/>}
            form={<PerformanceReviewFormClient/>}
        />
    )},
    {href: "/report", Component: () => (
        <WorkspacePage>
            <div className="flex min-h-[12rem] items-center justify-center p-8 text-sm text-base-content/50">
                Relatórios — em breve.
            </div>
        </WorkspacePage>
    )},
];

const REGISTRY_BY_HREF = new Map(WORKSPACE_PAGE_REGISTRY.map((e) => [e.href, e.Component]));

export function getWorkspacePageComponent(href: string): ComponentType | undefined {
    return REGISTRY_BY_HREF.get(href);
}
