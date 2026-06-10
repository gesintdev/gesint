import { VacationBalanceSidePanel } from "@/modules/person/vacation/components/VacationBalanceSidePanel";
import { VacationSplitPeriodsEditor } from "@/modules/person/vacation/components/VacationSplitPeriodsEditor";
import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";

type Props = {
    entitledDays: number;
    unjustifiedAbsences: number;
    justifiedAbsences: number;
    pecuniaryAllowanceDays: number;
    maxPecuniary: number;
    onUnjustifiedAbsencesChange: (value: number) => void;
    onJustifiedAbsencesChange: (value: number) => void;
    onPecuniaryChange: (value: number) => void;
    pecuniaryError?: string;
    periods: VacationSplitPeriod[];
    onPeriodsChange: (periods: VacationSplitPeriod[]) => void;
    periodsFieldError?: string;
};

export function VacationLegalPeriodsRightColumn({
    entitledDays,
    unjustifiedAbsences,
    justifiedAbsences,
    pecuniaryAllowanceDays,
    maxPecuniary,
    onUnjustifiedAbsencesChange,
    onJustifiedAbsencesChange,
    onPecuniaryChange,
    pecuniaryError,
    periods,
    onPeriodsChange,
    periodsFieldError,
}: Props) {
    return (
        <div className="flex flex-col gap-2">
            <VacationBalanceSidePanel
                entitledDays={entitledDays}
                periods={periods}
                unjustifiedAbsences={unjustifiedAbsences}
                justifiedAbsences={justifiedAbsences}
                pecuniaryAllowanceDays={pecuniaryAllowanceDays}
                maxPecuniary={maxPecuniary}
                onUnjustifiedAbsencesChange={onUnjustifiedAbsencesChange}
                onJustifiedAbsencesChange={onJustifiedAbsencesChange}
                onPecuniaryChange={onPecuniaryChange}
                pecuniaryError={pecuniaryError}
            />
            <VacationSplitPeriodsEditor periods={periods} onChange={onPeriodsChange} fieldError={periodsFieldError} />
        </div>
    );
}
