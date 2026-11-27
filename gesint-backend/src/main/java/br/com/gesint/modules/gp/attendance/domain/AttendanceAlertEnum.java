package br.com.gesint.modules.gp.attendance.domain;

/** Limites da CLT e pendencias que a apuracao do dia sinaliza. */
public enum AttendanceAlertEnum {
    /** Mais de 10 horas trabalhadas no dia (CLT art. 59). */
    OVER_10_HOURS,
    /** Mais de 2 horas extras no dia (CLT art. 59). */
    OVERTIME_OVER_2_HOURS,
    /** Jornada acima de 6 horas sem nenhum intervalo (CLT art. 71). */
    NO_BREAK,
    /** Jornada acima de 6 horas com intervalo menor que 1 hora (CLT art. 71). */
    SHORT_BREAK,
    /** Bloco de trabalho continuo acima de 6 horas. */
    OVER_6_HOURS_WITHOUT_BREAK,
    /** Menos de 11 horas de descanso entre duas jornadas (CLT art. 66). */
    SHORT_INTERJOURNEY,
    /** Entrada depois do horario da escala alem da tolerancia. */
    LATE_ARRIVAL,
    /** Saida antes do horario da escala alem da tolerancia. */
    EARLY_LEAVE,
    /** Ha solicitacao de ajuste aguardando decisao para o dia. */
    PENDING_REQUEST
}
