package br.com.gommo.modules.rh.person.jobvacancy.lib;

import java.text.Normalizer;
import java.util.Locale;

public final class JobVacancySlug {
    private static final int MAX_LENGTH = 120;

    private JobVacancySlug() {}

    public static String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        String value = Normalizer.normalize(raw.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (value.isEmpty()) {
            return null;
        }
        if (value.length() > MAX_LENGTH) {
            value = value.substring(0, MAX_LENGTH).replaceAll("-+$", "");
        }
        return value.isEmpty() ? null : value;
    }
}
