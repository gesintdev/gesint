package br.com.gommo.modules.dp.payment.service;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class PaymentPersonNameFormatter {

    private static final Set<String> LOWERCASE_PARTICLES =
            Set.of("da", "de", "do", "dos", "das", "e", "del", "van", "von");

    public String formatForDisplay(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        String[] parts = value.trim().split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < parts.length; index++) {
            if (index > 0) {
                builder.append(' ');
            }
            builder.append(formatToken(parts[index], index > 0));
        }
        return builder.toString();
    }

    private String formatToken(String token, boolean afterFirst) {
        if (token.isBlank()) {
            return token;
        }
        String lower = token.toLowerCase(Locale.ROOT);
        if (afterFirst && LOWERCASE_PARTICLES.contains(lower)) {
            return lower;
        }
        if (token.length() == 1) {
            return lower.toUpperCase(Locale.ROOT);
        }
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    public static String normalizeForComparison(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
        return normalized;
    }

    public static String stripParticles(String normalizedValue) {
        if (normalizedValue == null || normalizedValue.isBlank()) {
            return "";
        }
        return Arrays.stream(normalizedValue.split("\\s+"))
                .filter(token -> !LOWERCASE_PARTICLES.contains(token))
                .collect(Collectors.joining(" "));
    }

    public static Set<String> substantiveTokens(String normalizedValue) {
        if (normalizedValue == null || normalizedValue.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(normalizedValue.split("\\s+"))
                .filter(token -> !token.isBlank() && !LOWERCASE_PARTICLES.contains(token))
                .collect(Collectors.toCollection(HashSet::new));
    }
}
