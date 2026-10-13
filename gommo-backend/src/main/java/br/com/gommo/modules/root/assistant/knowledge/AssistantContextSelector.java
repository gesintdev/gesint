package br.com.gommo.modules.root.assistant.knowledge;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Classifica a intenção da mensagem para decidir catálogo determinístico vs LLM/skills.
 */
@Component
public class AssistantContextSelector {

    /**
     * Pedidos de dado/ação: não short-circuitar para “como chegar na tela”.
     */
    private static final Pattern DATA_OR_ACTION_PATTERN = Pattern.compile(
            "(?i)\\b("
                    + "traga|traz|busque|busca|procure|pesquisa|pesquise|"
                    + "mostre|mostra|liste|lista|consulte|consulta|"
                    + "resumo|resumidos?|resumir|detalhe|detalhes|dados?|"
                    + "status|andamento|situa[cç][aã]o|"
                    + "cpf|cnpj|matricula|rg\\b|"
                    + "quantos?|quanto|qual\\s+(e|é)|quais"
                    + ")\\b");

    /**
     * Orientação de rota/tela — sem keywords de domínio soltas (evita pegar “colaborador” em pedido de dado).
     */
    private static final Pattern NAVIGATION_PATTERN = Pattern.compile(
            "(?i)("
                    + "\\bonde\\s+(fica|est[aá]|encontro|acho|vejo|acesso|abre|fazer|crio|criar)\\b|"
                    + "\\bn[aã]o\\s+sei\\s+onde\\b|"
                    + "\\bcomo\\s+(acesso|entro|abro|chego|encontro|vejo|fa[cç]o|fazer)\\b|"
                    + "\\b(quero|preciso|tenho\\s+que)\\s+(fazer|criar|abrir|acessar)\\b|"
                    + "\\b(me\\s+leve|me\\s+leve\\s+para|abrir\\s+a\\s+tela|qual\\s+(menu|tela|caminho))\\b|"
                    + "\\b(menu|tela|rota|caminho|m[oó]dulo|se[cç][aã]o)\\b"
                    + ")");

    /** CPF com ou sem máscara (11 dígitos). */
    private static final Pattern CPF_PATTERN = Pattern.compile(
            "(?i)\\bcpf\\b|\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b");

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

    /**
     * True quando a mensagem pede orientação de onde/como acessar uma tela —
     * e não quando pede dado, resumo ou consulta por identificador.
     */
    public boolean needsRouteGuide(String latestUserMessage) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return false;
        }
        String normalized = latestUserMessage.trim().toLowerCase(Locale.ROOT);
        if (isSmallTalk(normalized)) {
            return false;
        }
        if (isDataOrActionRequest(normalized) || looksLikeCpfLookup(normalized)) {
            return false;
        }
        return NAVIGATION_PATTERN.matcher(normalized).find();
    }

    /** Pedido de dado/resumo/lista — deve ir para LLM/skills, não para guia de menu. */
    public boolean isDataOrActionRequest(String latestUserMessage) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return false;
        }
        String normalized = latestUserMessage.trim().toLowerCase(Locale.ROOT);
        return DATA_OR_ACTION_PATTERN.matcher(normalized).find();
    }

    /** Consulta por CPF (ou número no formato de CPF) — não devolver dado sensível no chat. */
    public boolean looksLikeCpfLookup(String latestUserMessage) {
        if (!StringUtils.hasText(latestUserMessage)) {
            return false;
        }
        return CPF_PATTERN.matcher(latestUserMessage.trim()).find();
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
