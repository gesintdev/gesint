import { InputString } from "@/shared/components/ui/input/index";

type Props = {
    unjustifiedAbsences: number;
    pecuniaryAllowanceDays: number;
    maxPecuniary: number;
    onUnjustifiedAbsencesChange: (value: number) => void;
    onPecuniaryChange: (value: number) => void;
    pecuniaryError?: string;
};

export function VacationBalanceSidePanel({
    unjustifiedAbsences,
    pecuniaryAllowanceDays,
    maxPecuniary,
    onUnjustifiedAbsencesChange,
    onPecuniaryChange,
    pecuniaryError,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputString
                label="Faltas injustificadas"
                value={String(unjustifiedAbsences)}
                onValueChange={(v) => onUnjustifiedAbsencesChange(Number.parseInt(v, 10) || 0)}
            />
            <InputString
                label={"Abono pecuni\u00e1rio (dias vendidos)"}
                value={String(pecuniaryAllowanceDays)}
                onValueChange={(v) => onPecuniaryChange(Number.parseInt(v, 10) || 0)}
                hint={`M\u00e1ximo ${maxPecuniary} dia(s) (at\u00e9 1/3)`}
                error={pecuniaryError}
            />
        </div>
    );
}
