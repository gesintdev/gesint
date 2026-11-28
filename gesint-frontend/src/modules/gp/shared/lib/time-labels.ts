import type {
    AttendanceAlert,
    AttendanceDayStatus,
    TimeStatusMetric,
} from "@/modules/gp/shared/dto/time-management.dto";

/** Rótulo + frase de explicação: a regra do GP é que todo status diga o que significa. */
export type ExplainedLabel = {
    label: string;
    help: string;
};

export const DAY_STATUS_LABELS: Record<AttendanceDayStatus, ExplainedLabel> = {
    OK: { label: "Completo", help: "Jornada com todas as marcações." },
    INCOMPLETE: {
        label: "Incompleto",
        help: "Falta entrada, saída ou a volta do intervalo. Peça o ajuste ou complete pelo RH.",
    },
    MISSING: { label: "Sem registro", help: "Dia de trabalho pela escala sem nenhuma marcação e sem justificativa." },
    IN_PROGRESS: { label: "Em andamento", help: "Jornada de hoje ainda aberta." },
    PENDING_START: { label: "Aguardando entrada", help: "Dia de trabalho que ainda não começou." },
    DAY_OFF: { label: "Folga", help: "Dia sem jornada prevista na escala." },
    HOLIDAY: { label: "Feriado", help: "Feriado nacional. Horas trabalhadas contam como crédito." },
    VACATION: { label: "Férias", help: "Férias aprovadas no RH. Não gera saldo." },
    LEAVE: { label: "Afastamento", help: "Afastamento ou atestado aprovado. A jornada conta como cumprida." },
    UNJUSTIFIED_ABSENCE: { label: "Falta", help: "Falta registrada como injustificada. Desconta a jornada do dia." },
    NOT_EMPLOYED: { label: "Antes da admissão", help: "Dia anterior à data de admissão." },
};

export const DAY_STATUS_TONE: Record<AttendanceDayStatus, "success" | "warning" | "error" | "info" | "neutral"> = {
    OK: "success",
    INCOMPLETE: "warning",
    MISSING: "error",
    IN_PROGRESS: "info",
    PENDING_START: "neutral",
    DAY_OFF: "neutral",
    HOLIDAY: "neutral",
    VACATION: "info",
    LEAVE: "info",
    UNJUSTIFIED_ABSENCE: "error",
    NOT_EMPLOYED: "neutral",
};

export const ALERT_LABELS: Record<AttendanceAlert, ExplainedLabel> = {
    OVER_10_HOURS: { label: "Acima de 10h", help: "Mais de 10 horas trabalhadas no dia (CLT, art. 59)." },
    OVERTIME_OVER_2_HOURS: { label: "Mais de 2h extras", help: "Mais de 2 horas além da jornada no dia (CLT, art. 59)." },
    NO_BREAK: { label: "Sem intervalo", help: "Jornada acima de 6 horas sem nenhum intervalo (CLT, art. 71)." },
    SHORT_BREAK: { label: "Intervalo curto", help: "Jornada acima de 6 horas com intervalo menor que 1 hora (CLT, art. 71)." },
    OVER_6_HOURS_WITHOUT_BREAK: { label: "6h seguidas", help: "Bloco de trabalho contínuo acima de 6 horas." },
    SHORT_INTERJOURNEY: { label: "Interjornada", help: "Menos de 11 horas de descanso desde a jornada anterior (CLT, art. 66)." },
    LATE_ARRIVAL: { label: "Atraso", help: "Entrada depois do horário da escala, além da tolerância." },
    EARLY_LEAVE: { label: "Saída antecipada", help: "Saída antes do horário da escala, além da tolerância." },
    PENDING_REQUEST: { label: "Ajuste pendente", help: "Há uma solicitação de ajuste aguardando decisão." },
};

export const OCCURRENCE_ORIGIN_LABELS: Record<string, string> = {
    MOBILE: "Aplicativo",
    MANUAL: "Lançado pelo RH",
    LEAVE_REQUEST: "Afastamento",
};

export type StatusMetricInfo = ExplainedLabel & {
    /** Visão Hoje (situação de agora) ou Período. */
    view: "TODAY" | "PERIOD";
    /** Como ler a coluna de minutos da linha. */
    valueLabel: string;
    /** Linha por colaborador (resumo) ou por dia. */
    grain: "COLLABORATOR" | "DAY";
};

export const STATUS_METRICS: Record<TimeStatusMetric, StatusMetricInfo> = {
    WORKING: {
        view: "TODAY",
        grain: "DAY",
        label: "Trabalhando",
        help: "Quem está com a jornada em andamento neste momento.",
        valueLabel: "Trabalhado hoje",
    },
    ON_BREAK: {
        view: "TODAY",
        grain: "DAY",
        label: "Em intervalo",
        help: "Quem saiu para o intervalo e ainda não voltou.",
        valueLabel: "Trabalhado hoje",
    },
    LATE: {
        view: "TODAY",
        grain: "DAY",
        label: "Atrasados",
        help: "Quem já deveria ter registrado a entrada e ainda não registrou.",
        valueLabel: "Atraso até agora",
    },
    IN_OVERTIME: {
        view: "TODAY",
        grain: "DAY",
        label: "Em hora extra",
        help: "Quem está trabalhando além da jornada prevista para hoje.",
        valueLabel: "Além da jornada",
    },
    EARLY_LEAVE_TODAY: {
        view: "TODAY",
        grain: "DAY",
        label: "Saída antecipada",
        help: "Quem encerrou a jornada de hoje antes de cumprir o previsto.",
        valueLabel: "Antes do horário",
    },
    AWAY: {
        view: "TODAY",
        grain: "DAY",
        label: "Ausentes hoje",
        help: "Quem está de férias, afastado ou com falta registrada hoje.",
        valueLabel: "",
    },
    ABSENTEEISM: {
        view: "PERIOD",
        grain: "COLLABORATOR",
        label: "Absenteísmo",
        help: "Percentual de horas de falta sobre a jornada prevista no período.",
        valueLabel: "Horas de falta",
    },
    OVERTIME: {
        view: "PERIOD",
        grain: "COLLABORATOR",
        label: "Horas além da jornada",
        help: "Horas trabalhadas acima do previsto (banco de horas ou hora extra).",
        valueLabel: "Horas além",
    },
    OVER_10_HOURS: {
        view: "PERIOD",
        grain: "DAY",
        label: "Acima de 10 horas",
        help: "Dias com mais de 10 horas trabalhadas.",
        valueLabel: "Trabalhado",
    },
    OVERTIME_OVER_2_HOURS: {
        view: "PERIOD",
        grain: "DAY",
        label: "Mais de 2h extras",
        help: "Dias com mais de 2 horas além da jornada.",
        valueLabel: "Além da jornada",
    },
    OVER_6_HOURS_WITHOUT_BREAK: {
        view: "PERIOD",
        grain: "DAY",
        label: "6 horas sem pausa",
        help: "Blocos de trabalho contínuo acima de 6 horas.",
        valueLabel: "Trabalhado",
    },
    NO_BREAK: {
        view: "PERIOD",
        grain: "DAY",
        label: "Sem intervalo",
        help: "Jornadas acima de 6 horas sem nenhum intervalo.",
        valueLabel: "Trabalhado",
    },
    SHORT_BREAK: {
        view: "PERIOD",
        grain: "DAY",
        label: "Intervalo menor que 1 hora",
        help: "Jornadas acima de 6 horas com intervalo menor que 1 hora.",
        valueLabel: "Intervalo",
    },
    SHORT_INTERJOURNEY: {
        view: "PERIOD",
        grain: "DAY",
        label: "Interjornada menor que 11h",
        help: "Descanso menor que 11 horas entre duas jornadas.",
        valueLabel: "Descanso",
    },
    LATE_ARRIVAL: {
        view: "PERIOD",
        grain: "DAY",
        label: "Atrasos",
        help: "Entradas depois do horário da escala, além da tolerância.",
        valueLabel: "Atraso",
    },
    EARLY_LEAVE: {
        view: "PERIOD",
        grain: "DAY",
        label: "Saídas antecipadas",
        help: "Saídas antes do horário da escala, além da tolerância.",
        valueLabel: "Antes do horário",
    },
    MISSING_DAYS: {
        view: "PERIOD",
        grain: "DAY",
        label: "Dias sem registro",
        help: "Dias de trabalho sem nenhuma marcação e sem justificativa.",
        valueLabel: "Jornada prevista",
    },
    INCOMPLETE_DAYS: {
        view: "PERIOD",
        grain: "DAY",
        label: "Marcações incompletas",
        help: "Dias com entrada, saída ou volta do intervalo faltando.",
        valueLabel: "Trabalhado",
    },
};

export const TODAY_METRICS = (Object.keys(STATUS_METRICS) as TimeStatusMetric[]).filter(
    (metric) => STATUS_METRICS[metric].view === "TODAY",
);
export const PERIOD_METRICS = (Object.keys(STATUS_METRICS) as TimeStatusMetric[]).filter(
    (metric) => STATUS_METRICS[metric].view === "PERIOD",
);

export const REQUEST_TYPE_LABELS: Record<string, string> = {
    TIME_ADJUSTMENT: "Ajuste de horário",
    DAY_ABSENCE_EXCUSE: "Abono do dia",
    MEDICAL_CERTIFICATE: "Atestado",
    LEAVE_ABSENCE: "Afastamento",
    HOUR_BANK: "Banco de horas",
    OUTSIDE_SCHEDULE: "Ponto fora da escala",
    OTHER: "Outro",
};

export const ABSENCE_CATEGORY_LABELS: Record<"VACATION" | "LEAVE" | "ABSENCE", string> = {
    VACATION: "Férias",
    LEAVE: "Afastamento",
    ABSENCE: "Falta",
};
