package br.com.gesint.core.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Contagem de dias uteis com os feriados nacionais da Lei 662/1949 e da Lei 6.802/1980, mais os
 * moveis derivados da Pascoa (Carnaval e Corpus Christi, que sao ponto facultativo federal mas sao
 * tratados como nao uteis pela pratica de departamento pessoal).
 *
 * <p>Limitacao conhecida: nao contempla feriados estaduais e municipais nem calendario configuravel
 * por tenant. Prazos calculados aqui podem ficar um ou dois dias mais curtos do que o real quando o
 * municipio tem feriado proprio, o que e o lado seguro do erro.
 */
public final class BrazilianBusinessCalendar {

    private BrazilianBusinessCalendar() {}

    public static boolean isBusinessDay(LocalDate date) {
        if (date == null) {
            return false;
        }
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return false;
        }
        return !nationalHolidays(date.getYear()).contains(date);
    }

    /** Dias uteis entre {@code start} (exclusive) e {@code end} (inclusive). */
    public static int businessDaysBetweenExclusive(LocalDate start, LocalDate end) {
        if (start == null || end == null || !end.isAfter(start)) {
            return 0;
        }
        int count = 0;
        LocalDate cursor = start;
        while (cursor.isBefore(end)) {
            cursor = cursor.plusDays(1);
            if (isBusinessDay(cursor)) {
                count++;
            }
        }
        return count;
    }

    /** Data resultante de somar {@code businessDays} dias uteis, sem contar o dia de partida. */
    public static LocalDate addBusinessDays(LocalDate start, int businessDays) {
        if (start == null) {
            return null;
        }
        LocalDate cursor = start;
        int remaining = Math.max(0, businessDays);
        while (remaining > 0) {
            cursor = cursor.plusDays(1);
            if (isBusinessDay(cursor)) {
                remaining--;
            }
        }
        return cursor;
    }

    public static Set<LocalDate> nationalHolidays(int year) {
        Set<LocalDate> holidays = new HashSet<>();
        holidays.add(LocalDate.of(year, 1, 1));
        holidays.add(LocalDate.of(year, 4, 21));
        holidays.add(LocalDate.of(year, 5, 1));
        holidays.add(LocalDate.of(year, 9, 7));
        holidays.add(LocalDate.of(year, 10, 12));
        holidays.add(LocalDate.of(year, 11, 2));
        holidays.add(LocalDate.of(year, 11, 15));
        holidays.add(LocalDate.of(year, 11, 20));
        holidays.add(LocalDate.of(year, 12, 25));

        LocalDate easter = easterSunday(year);
        holidays.add(easter.minusDays(48));
        holidays.add(easter.minusDays(47));
        holidays.add(easter.minusDays(2));
        holidays.add(easter.plusDays(60));
        return holidays;
    }

    /** Algoritmo de Meeus/Jones/Butcher para o calendario gregoriano. */
    private static LocalDate easterSunday(int year) {
        int a = year % 19;
        int b = year / 100;
        int c = year % 100;
        int d = b / 4;
        int e = b % 4;
        int f = (b + 8) / 25;
        int g = (b - f + 1) / 3;
        int h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4;
        int k = c % 4;
        int l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int month = (h + l - 7 * m + 114) / 31;
        int day = ((h + l - 7 * m + 114) % 31) + 1;
        return LocalDate.of(year, month, day);
    }
}
