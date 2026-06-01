package br.com.gommo.core.util;

import java.util.Locale;

public final class TextSearchUtils {

    private TextSearchUtils() {}

    /** Padrão {@code %termo%} em minúsculas para {@code LIKE}; {@code null} se vazio. */
    public static String toLikePattern(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
