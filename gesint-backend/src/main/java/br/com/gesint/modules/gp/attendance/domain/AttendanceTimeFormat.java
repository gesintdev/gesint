package br.com.gesint.modules.gp.attendance.domain;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/** Formatos de horas usados no espelho, nos e-mails e nas notificacoes. */
public final class AttendanceTimeFormat {

    private static final DateTimeFormatter CLOCK = DateTimeFormatter.ofPattern("HH:mm");

    private AttendanceTimeFormat() {}

    /** 503 -> "08h23". */
    public static String duration(int minutes) {
        int abs = Math.abs(minutes);
        return String.format("%02dh%02d", abs / 60, abs % 60);
    }

    /** 503 -> "+08h23", -503 -> "-08h23", 0 -> "00h00". */
    public static String signed(int minutes) {
        if (minutes == 0) {
            return "00h00";
        }
        return (minutes > 0 ? "+" : "-") + duration(minutes);
    }

    public static String clock(LocalTime time) {
        return time == null ? "" : CLOCK.format(time);
    }
}
