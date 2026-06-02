export type ContractType = "CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN";

export type VacationPeriodStatus =
    | "ACQUIRING"
    | "AVAILABLE"
    | "CONCESSIVE"
    | "EXPIRED"
    | "FORFEITED";

export type DateRange = {
    start: string;
    end: string;
};

export type VacationPeriodContext = {
    contractType: ContractType;
    hireDate: string | null;
    baseSalary: number | null;
    acquisition: DateRange | null;
    concessive: DateRange | null;
    status: VacationPeriodStatus;
    entitledDays: number;
    unjustifiedAbsences: number;
    /** Período aquisitivo em foco (0 = primeiro ano de trabalho). */
    periodIndex?: number;
};

export type VacationSplitPeriod = {
    startDate: string;
    endDate: string;
};

export type VacationPaymentEstimate = {
    vacationPay: number;
    constitutionalThird: number;
    grossTotal: number;
    paymentDeadline: string | null;
};
