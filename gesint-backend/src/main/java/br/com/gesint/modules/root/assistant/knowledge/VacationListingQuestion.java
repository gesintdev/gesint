package br.com.gesint.modules.root.assistant.knowledge;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reconhece pergunta do tipo "por que fulano não aparece na listagem de férias" e tira o nome.
 */
public final class VacationListingQuestion {

    private static final Pattern MISSING = Pattern.compile(
            "(?iu)n[aã]o\\s+(?:aparece|est[aá]|sai|entra|consta)|\\bsumiu\\b");
    private static final Pattern VACATION = Pattern.compile("(?iu)f[eé]rias|\\bgozo\\b|\\brecesso\\b");
    private static final Pattern OTHER_SUBJECT = Pattern.compile(
            "(?iu)\\bponto\\b|batida|marca[cç][aã]o|admiss[aã]o|experi[eê]ncia|desligamento");
    private static final Pattern LISTING = Pattern.compile("(?iu)listagem|consulta|lan[cç]ar");
    private static final Pattern AFTER_COLLABORATOR = Pattern.compile(
            "(?iu)colaborador(?:a)?\\s+([\\p{L}][\\p{L}'’.-]*(?:\\s+[\\p{L}][\\p{L}'’.-]*){0,5}?)\\s+n[aã]o\\b");
    private static final Pattern BEFORE_MISSING = Pattern.compile(
            "(?iu)([\\p{L}][\\p{L}'’.-]*(?:\\s+[\\p{L}][\\p{L}'’.-]*){0,5}?)\\s+n[aã]o\\s+(?:aparece|est[aá]|sai|entra|consta)\\b");
    private static final Set<String> STOP_NAMES = Set.of(
            "ele",
            "ela",
            "esse",
            "essa",
            "isso",
            "alguem",
            "colaborador",
            "colaboradora",
            "pessoa",
            "funcionario",
            "funcionaria",
            "listagem",
            "ferias",
            "menu",
            "tela");

    private VacationListingQuestion() {}

    public static boolean matches(String message, String menuLabel) {
        if (message == null || message.isBlank() || !MISSING.matcher(message).find()) {
            return false;
        }
        boolean namesVacation = VACATION.matcher(message).find();
        if (OTHER_SUBJECT.matcher(message).find() && !namesVacation) {
            return false;
        }
        if (namesVacation) {
            return true;
        }
        return menuMentionsVacation(menuLabel) && LISTING.matcher(message).find();
    }

    /** Nome citado na pergunta, ou vazio quando a pergunta é sobre a listagem mas não diz quem. */
    public static String nameIn(String message) {
        if (message == null || message.isBlank()) {
            return "";
        }
        String fromRole = capture(AFTER_COLLABORATOR, message);
        if (!fromRole.isEmpty()) {
            return fromRole;
        }
        return capture(BEFORE_MISSING, message);
    }

    private static boolean menuMentionsVacation(String menuLabel) {
        return menuLabel != null && fold(menuLabel).contains("ferias");
    }

    private static String capture(Pattern pattern, String message) {
        Matcher matcher = pattern.matcher(message);
        if (!matcher.find()) {
            return "";
        }
        String raw = matcher.group(1) == null ? "" : matcher.group(1).trim();
        raw = raw.replaceAll("(?iu)^(?:(?:por\\s*que|porque|pq|o|a|os|as)\\s+)+", "").trim();
        if (raw.length() < 2 || STOP_NAMES.contains(fold(raw))) {
            return "";
        }
        return raw;
    }

    private static String fold(String value) {
        String withoutMarks = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return withoutMarks.toLowerCase(Locale.ROOT).trim();
    }
}
