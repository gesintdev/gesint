"use client";

import { AbsenceCalendarBoard } from "@/modules/gp/calendar/components/AbsenceCalendarBoard";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";

/** Agenda de férias, afastamentos e faltas (somente leitura: o cadastro é do RH e do DP). */
export function AbsenceCalendarPage() {
    return (
        <WorkspacePage>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <AbsenceCalendarBoard maxPerDay={4} />
            </div>
        </WorkspacePage>
    );
}

export default AbsenceCalendarPage;
