import { VacationBalanceSidePanel } from "@/modules/person/vacation/components/VacationBalanceSidePanel";
import { VacationSplitPeriodsEditor } from "@/modules/person/vacation/components/VacationSplitPeriodsEditor";
import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";

type Props = {
    unjustifiedAbsences: number;
    pecuniaryAllowanceDays: number;
    maxPecuniary: number;
    onUnjustifiedAbsencesChange: (value: number) => void;
    onPecuniaryChange: (value: number) => void;
    pecuniaryError?: string;
    periods: VacationSplitPeriod[];
    onPeriodsChange: (periods: VacationSplitPeriod[]) => void;
    periodsFieldError?: string;
};

export function VacationLegalPeriodsRightColumn({
    unjustifiedAbsences,
    pecuniaryAllowanceDays,
    maxPecuniary,
    onUnjustifiedAbsencesChange,
    onPecuniaryChange,
    pecuniaryError,
    periods,
    onPeriodsChange,
    periodsFieldError,
}: Props) {
    return (
        <div className="flex flex-col gap-4">
            <VacationBalanceSidePanel
                unjustifiedAbsences={unjustifiedAbsences}
                pecuniaryAllowanceDays={pecuniaryAllowanceDays}
                maxPecuniary={maxPecuniary}
                onUnjustifiedAbsencesChange={onUnjustifiedAbsencesChange}
                onPecuniaryChange={onPecuniaryChange}
                pecuniaryError={pecuniaryError}
            />
            <VacationSplitPeriodsEditor
                periods={periods}
                onChange={onPeriodsChange}
                fieldError={periodsFieldError}
            />
        </div>
    );
}
