package br.com.gesint.modules.root.assistant.knowledge;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Reconhece pergunta do tipo "por que fulano não aparece para lançar ponto".
 */
public final class AttendanceListingQuestion {

    private static final Pattern MISSING = Pattern.compile(
            "(?iu)n[aã]o\\s+(?:aparece|est[aá]|sai|entra|consta)|\\bsumiu\\b");
    private static final Pattern ATTENDANCE = Pattern.compile("(?iu)\\bponto\\b|batida|marca[cç][aã]o|espelho|jornada");
    private static final Pattern OTHER_SUBJECT = Pattern.compile(
            "(?iu)f[eé]rias|\\bgozo\\b|\\brecesso\\b|admiss[aã]o|experi[eê]ncia|desligamento");
    private static final Pattern LISTING = Pattern.compile("(?iu)listagem|consulta|lan[cç]ar");

    private AttendanceListingQuestion() {}

    public static boolean matches(String message, String menuLabel) {
        if (message == null || message.isBlank() || !MISSING.matcher(message).find()) {
            return false;
        }
        boolean namesAttendance = ATTENDANCE.matcher(message).find();
        if (OTHER_SUBJECT.matcher(message).find() && !namesAttendance) {
            return false;
        }
        if (namesAttendance) {
            return true;
        }
        return menuMentionsAttendance(menuLabel) && LISTING.matcher(message).find();
    }

    public static String nameIn(String message) {
        return VacationListingQuestion.nameIn(message);
    }

    private static boolean menuMentionsAttendance(String menuLabel) {
        if (menuLabel == null) {
            return false;
        }
        String folded = Normalizer.normalize(menuLabel, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return folded.toLowerCase(Locale.ROOT).contains("ponto");
    }
}
