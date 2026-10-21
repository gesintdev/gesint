package br.com.gesint.modules.root.assistant.guard;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Detecta tentativas óbvias de bypass (jailbreak / roleplay de permissão).
 */
@Component
public class AssistantJailbreakDetector {

    private static final List<Pattern> PATTERNS = List.of(
            Pattern.compile("ignore\\s+(as\\s+)?(suas\\s+)?regras", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE),
            Pattern.compile("ignore\\s+(all\\s+)?(previous\\s+)?instructions?", Pattern.CASE_INSENSITIVE),
            Pattern.compile("finja\\s+que\\s+(eu\\s+)?tenho\\s+permiss", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE),
            Pattern.compile("pretend\\s+(you|i)\\s+(are|have)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("situa[cç][aã]o\\s+hipot[eé]tica", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE),
            Pattern.compile("dan\\s*mode|developer\\s*mode|jailbreak", Pattern.CASE_INSENSITIVE),
            Pattern.compile("desative\\s+(o\\s+)?filtro", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE),
            Pattern.compile("bypass(e)?\\s+(a\\s+)?permiss", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE),
            Pattern.compile("a[ct]ue\\s+como\\s+(se\\s+)?(n[aã]o\\s+tivesse|sem)\\s+restri", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE));

    public boolean isJailbreakAttempt(String message) {
        if (!StringUtils.hasText(message)) {
            return false;
        }
        String normalized = message.trim().toLowerCase(Locale.ROOT);
        for (Pattern pattern : PATTERNS) {
            if (pattern.matcher(normalized).find()) {
                return true;
            }
        }
        return false;
    }
}
