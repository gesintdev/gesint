import type { DevelopmentPlan, DevelopmentPlanCreateDto, DevelopmentPlanFormDto } from "@/modules/rh/person/developmentplan/dto/development-plan.dto";

export const emptyDevelopmentPlanForm = (): DevelopmentPlanFormDto => ({
    collaboratorId: "",
    collaboratorName: "",
    registrationNumber: "",
    jobPositionId: "",
    jobPositionName: "",
    targetJobPositionId: "",
    targetJobPositionName: "",
    departmentId: "",
    departmentName: "",
    managerName: "",
    trackName: "",
    originName: "",
    startDate: "",
    endDate: "",
    checkinFrequency: "MONTHLY",
    checkinFrequencyDays: undefined,
    notes: "",
    competencies: [],
    goals: [],
    checkins: [],
    evidences: [],
});

export const developmentPlanToFormDto = (plan: DevelopmentPlan): DevelopmentPlanFormDto => ({
    collaboratorId: plan.collaboratorId,
    collaboratorName: plan.collaboratorName ?? "",
    registrationNumber: plan.registrationNumber ?? "",
    jobPositionId: plan.jobPositionId,
    jobPositionName: plan.jobPositionName ?? "",
    targetJobPositionId: plan.targetJobPositionId,
    targetJobPositionName: plan.targetJobPositionName ?? "",
    departmentId: plan.departmentId,
    departmentName: plan.departmentName ?? "",
    managerId: plan.managerId,
    managerName: plan.managerName ?? "",
    trackId: plan.trackId,
    trackName: plan.trackName ?? "",
    originId: plan.originId,
    originName: plan.originName ?? "",
    startDate: plan.startDate ?? "",
    endDate: plan.endDate ?? "",
    checkinFrequency: plan.checkinFrequency ?? "MONTHLY",
    checkinFrequencyDays: plan.checkinFrequencyDays,
    planStatus: plan.planStatus,
    notes: plan.notes ?? "",
    competencies: plan.competencies ?? [],
    goals: plan.goals ?? [],
    checkins: plan.checkins ?? [],
    evidences: plan.evidences ?? [],
});
export const developmentPlanToRequestDto = (form: DevelopmentPlanFormDto): DevelopmentPlanCreateDto => {
    const {
        collaboratorName: _collaboratorName,
        registrationNumber: _registrationNumber,
        ...request
    } = form;
    return request;
};