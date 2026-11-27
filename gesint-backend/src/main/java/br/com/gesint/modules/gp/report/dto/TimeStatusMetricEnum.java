package br.com.gesint.modules.gp.report.dto;

/** Metricas do relatorio Status dos colaboradores. As de hoje leem so o dia corrente. */
public enum TimeStatusMetricEnum {
    // Hoje
    WORKING(true),
    ON_BREAK(true),
    LATE(true),
    IN_OVERTIME(true),
    EARLY_LEAVE_TODAY(true),
    AWAY(true),
    // Periodo
    ABSENTEEISM(false),
    OVERTIME(false),
    OVER_10_HOURS(false),
    OVERTIME_OVER_2_HOURS(false),
    OVER_6_HOURS_WITHOUT_BREAK(false),
    NO_BREAK(false),
    SHORT_BREAK(false),
    SHORT_INTERJOURNEY(false),
    LATE_ARRIVAL(false),
    EARLY_LEAVE(false),
    MISSING_DAYS(false),
    INCOMPLETE_DAYS(false);

    private final boolean today;

    TimeStatusMetricEnum(boolean today) {
        this.today = today;
    }

    public boolean isToday() {
        return today;
    }
}
