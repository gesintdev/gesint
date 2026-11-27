package br.com.gesint.modules.gp.attendance.domain;

/** Situacao apurada de um dia do colaborador. */
public enum AttendanceDayStatusEnum {
    /** Dia com jornada e marcacoes completas. */
    OK,
    /** Dia passado com marcacao faltando (ex.: entrada sem saida). Pede correcao. */
    INCOMPLETE,
    /** Dia de trabalho passado sem nenhuma marcacao e sem justificativa. */
    MISSING,
    /** Hoje, com jornada aberta. */
    IN_PROGRESS,
    /** Hoje ou futuro, ainda sem marcacao. */
    PENDING_START,
    /** Folga ou descanso pela escala. */
    DAY_OFF,
    /** Feriado nacional. */
    HOLIDAY,
    /** Ferias aprovadas. */
    VACATION,
    /** Afastamento ou atestado aprovado. */
    LEAVE,
    /** Falta registrada como injustificada. */
    UNJUSTIFIED_ABSENCE,
    /** Antes da admissao. */
    NOT_EMPLOYED
}
