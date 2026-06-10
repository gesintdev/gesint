import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";
import { summarizeVacationBalance } from "@/modules/person/vacation/lib/vacation-rules";
import { InputNumber } from "@/shared/components/ui/input/index";
import { VacationBalanceDaysInfo } from "@/modules/person/vacation/components/VacationBalanceDaysInfo";

type Props = {
    entitledDays: number;
    periods: VacationSplitPeriod[];
    unjustifiedAbsences: number;
    justifiedAbsences: number;
    pecuniaryAllowanceDays: number;
    maxPecuniary: number;
    onUnjustifiedAbsencesChange: (value: number) => void;
    onJustifiedAbsencesChange: (value: number) => void;
    onPecuniaryChange: (value: number) => void;
    pecuniaryError?: string;
};

export function VacationBalanceSidePanel({
    entitledDays,
    periods,
    unjustifiedAbsences,
    justifiedAbsences,
    pecuniaryAllowanceDays,
    maxPecuniary,
    onUnjustifiedAbsencesChange,
    onJustifiedAbsencesChange,
    onPecuniaryChange,
    pecuniaryError,
}: Props) {
    const balance = summarizeVacationBalance(entitledDays, periods, pecuniaryAllowanceDays);
    const remainingClass =
        balance.remainingDays < 0 ? "text-error" : balance.remainingDays === 0 ? "text-success" : "text-base-content";

    return (
        <div className="grid gap-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InputNumber
                    label="Faltas injustificadas"
                    integer
                    align="left"
                    value={unjustifiedAbsences}
                    onValueChange={(v) => onUnjustifiedAbsencesChange(v ?? 0)}
                    hint={`Direito atual: ${entitledDays} dia(s) (tabela CLT art. 130)`}
                />
                <InputNumber
                    label="Faltas justificadas / atestados"
                    integer
                    align="left"
                    value={justifiedAbsences}
                    onValueChange={(v) => onJustifiedAbsencesChange(v ?? 0)}
                    hint="Informativo — não reduz dias de férias (CLT)"
                />
                <InputNumber
                    label="Abono pecuniário (dias vendidos)"
                    integer
                    align="left"
                    value={pecuniaryAllowanceDays}
                    onValueChange={(v) => onPecuniaryChange(v ?? 0)}
                    hint={`Máximo ${maxPecuniary} dia(s) (até 1/3 do período)`}
                    error={pecuniaryError}
                />
            </div>
            <div className="rounded-lg min-h-19 border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Saldo de dias</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                    <VacationBalanceDaysInfo title={"Direito"} entitledDays={balance.entitledDays} />
                    <VacationBalanceDaysInfo title={"Gozo"} entitledDays={balance.gozoDays} />
                    <VacationBalanceDaysInfo title={"Vendidos"} entitledDays={balance.pecuniaryDays} />
                    <VacationBalanceDaysInfo
                        title={"Restante"}
                        className={remainingClass}
                        entitledDays={balance.remainingDays}
                    />
                </dl>
                {balance.remainingDays < 0 ? (
                    <p className="mt-2 text-xs text-error">
                        Gozo + abono excede o saldo disponível em {Math.abs(balance.remainingDays)} dia(s).
                    </p>
                ) : null}
            </div>
        </div>
    );
}
