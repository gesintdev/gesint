package br.com.gommo.modules.root.assistant.knowledge;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Decide qual conhecimento injetar no prompt, para não gastar tokens à toa.
 */
@Component
public class AssistantContextSelector {

    private static final Pattern NAVIGATION_PATTERN = Pattern.compile(
            "(?i)\\b("
                    + "onde\\s+(fica|est[aá]|encontro|acho|vejo|acesso|abre)|"
                    + "como\\s+(acesso|entro|abro|chego|encontro|vejo)|"
                    + "menu|tela|rota|caminho|m[oó]dulo|se[cç][aã]o|"
                    + "\\bdp\\b|\\brh\\b|\\bctb\\b|\\bcfg\\b|configura|"
                    + "vagas?|candidato|candidatura|admiss[aã]o|colaborador|folha|"
                    + "holerite|ponto|f[eé]rias|afastamento|desligamento|pdi|desempenho|"
                    + "relat[oó]rio|pagamento|departamento|cargo|escala|benef[ií]cio"
                    + ")\\b");

    private static final Set<String> SMALL_TALK = Set.of(
            "oi",
            "olá",
            "ola",
            "oie",
            "eai",
            "e aí",
            "e ai",
            "hey",
            "hi",
            "hello",
            "bom dia",
            "boa tarde",
            "boa noite",
            "obrigado",
            "obrigada",
            "valeu",
            "thanks",
            "ok",
            "beleza",
            "blz",
            "tudo bem",
            "tudo bom",
            "td bem",
            "td bom");

    public boolean needsRouteGuide(String latestUserMessage) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return false;
        }
        String normalized = latestUserMessage.trim().toLowerCase(Locale.ROOT);
        if (isSmallTalk(normalized)) {
            return false;
        }
        return NAVIGATION_PATTERN.matcher(normalized).find();
    }

    public boolean isSmallTalk(String latestUserMessage) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return false;
        }
        String normalized = latestUserMessage.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        if (SMALL_TALK.contains(normalized)) {
            return true;
        }
        String stripped = normalized.replaceAll("[!?.,…]+$", "").trim();
        return SMALL_TALK.contains(stripped) && stripped.length() <= 24;
    }
}
