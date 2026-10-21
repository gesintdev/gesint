"use client";

import { VacationRequestFormClient } from "@/modules/rh/person/vacation/components/VacationRequestFormClient";

/** Wrapper RH: mesmo formulário do DP, em modo solicitação. */
export function LeaveVacationRequestFormClient() {
    return <VacationRequestFormClient mode="rh" />;
}
