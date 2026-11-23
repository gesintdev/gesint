package br.com.gesint.modules.root.assistant.service;

import java.util.List;
import java.util.Locale;

import org.springframework.util.StringUtils;

import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.dto.AssistantDeepLinkDto;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogItem;

/**
 * Resposta sobre o menu que o usuário já escolheu. Explica a tela, sem o caminho até ela.
 */
public final class AssistantMenuReply {

    private AssistantMenuReply() {}

    public static AssistantChatResponseDto build(
            AssistantCatalogItem item, String menuLabel, String userName, boolean opening) {
        String menu = menuName(item, menuLabel);
        if (item == null) {
            return AssistantChatResponseDto.builder()
                    .reply(missingGuide(menu, userName, opening))
                    .links(List.of())
                    .build();
        }

        StringBuilder reply = new StringBuilder();
        if (opening) {
            String who = cleanUserName(userName);
            if (StringUtils.hasText(who)) {
                reply.append("Olá, ").append(who).append(". ");
            } else {
                reply.append("Olá. ");
            }
        }
        reply.append("O menu **").append(menu).append("** serve para ").append(purpose(item)).append('.');

        if (item.getGuidance() != null) {
            boolean any = false;
            for (String line : item.getGuidance()) {
                if (!StringUtils.hasText(line)) {
                    continue;
                }
                if (!any) {
                    reply.append("\n");
                    any = true;
                }
                reply.append("\n- ").append(line.trim());
            }
        }

        int step = 1;
        if (item.getSteps() != null) {
            for (String line : item.getSteps()) {
                if (!StringUtils.hasText(line) || isArrivalStep(line, item)) {
                    continue;
                }
                if (step == 1) {
                    reply.append("\n\nNa tela:");
                }
                reply.append("\n").append(step++).append(". ").append(line.trim());
            }
        }

        if (opening) {
            reply.append("\n\nPode perguntar o que quiser sobre esse menu.");
        }

        AssistantChatResponseDto.AssistantChatResponseDtoBuilder builder = AssistantChatResponseDto.builder()
                .reply(reply.toString().trim());
        if (StringUtils.hasText(item.getHref())) {
            builder.links(List.of(AssistantDeepLinkDto.builder()
                    .label("Abrir " + menu)
                    .href(item.getHref().trim())
                    .build()));
        } else {
            builder.links(List.of());
        }
        return builder.build();
    }

    private static String missingGuide(String menu, String userName, boolean opening) {
        String who = cleanUserName(userName);
        String hello = opening && StringUtils.hasText(who) ? "Olá, " + who + ". " : opening ? "Olá. " : "";
        return hello
                + "Ainda não tenho um guia do menu **"
                + menu
                + "**. Diz o que você quer fazer nele que eu te oriento na tela.";
    }

    private static String menuName(AssistantCatalogItem item, String menuLabel) {
        if (item != null && StringUtils.hasText(item.getMenu())) {
            return item.getMenu().trim();
        }
        if (StringUtils.hasText(menuLabel)) {
            return menuLabel.trim();
        }
        return "este menu";
    }

    private static String purpose(AssistantCatalogItem item) {
        String action = StringUtils.hasText(item.getAction()) ? item.getAction().trim() : item.getTopic();
        if (!StringUtils.hasText(action)) {
            return "o que essa tela faz";
        }
        return decapitalize(action);
    }

    private static String decapitalize(String value) {
        if (value.length() < 2) {
            return value.toLowerCase(Locale.ROOT);
        }
        if (Character.isUpperCase(value.charAt(0)) && Character.isLowerCase(value.charAt(1))) {
            return Character.toLowerCase(value.charAt(0)) + value.substring(1);
        }
        return value;
    }

    /** Passo que só leva até o menu. Quem abriu o chat por ele já está lá. */
    static boolean isArrivalStep(String line, AssistantCatalogItem item) {
        String normalized = line.trim().toLowerCase(Locale.ROOT);
        if (normalized.startsWith("abra o sistema")) {
            return true;
        }
        if (!normalized.startsWith("acesse ")) {
            return false;
        }
        return containsName(normalized, item.getMenu()) || containsName(normalized, item.getTopic());
    }

    private static boolean containsName(String normalizedLine, String name) {
        if (!StringUtils.hasText(name)) {
            return false;
        }
        return normalizedLine.contains(name.trim().toLowerCase(Locale.ROOT));
    }

    /**
     * Contexto para o modelo nas mensagens seguintes. O usuário já está neste menu.
     */
    public static String modelContext(AssistantCatalogItem item, String menuLabel) {
        String menu = menuName(item, menuLabel);
        StringBuilder text = new StringBuilder();
        text.append("## CONVERSA JÁ ABERTA NESTE MENU\n");
        text.append("O usuário abriu o chat pelo menu ").append(menu);
        text.append(" e já sabe onde ele fica. A mensagem dele é uma pergunta sobre essa tela, não um pedido de caminho.\n");
        text.append("Responda a pergunta. Não monte o roteiro Sistema/Menu/Tela, não diga para abrir ou acessar esse menu e não use guide_flow para repetir o caminho.\n");
        if (item != null) {
            text.append("O que a tela faz: ").append(purpose(item)).append(".\n");
            if (item.getGuidance() != null) {
                for (String line : item.getGuidance()) {
                    if (StringUtils.hasText(line)) {
                        text.append("- ").append(line.trim()).append('\n');
                    }
                }
            }
        }
        text.append("Se a pergunta for de uma pessoa ou de um caso, trate esse caso na tela deste menu. ");
        text.append("Não responda com a regra de outra tela: ponto não se explica com férias, e férias não se explica com ponto. ");
        if (menuMentions(menu, "férias") || menuMentions(menu, "ferias")) {
            text.append("Se for por que alguém não aparece na listagem de férias, use diagnose_vacation_listing e repita o texto devolvido. ");
        } else if (menuMentions(menu, "ponto")) {
            text.append("Se for por que alguém não aparece para lançar ponto, use diagnose_attendance_listing e repita o texto devolvido. ");
        }
        text.append("Se não houver ferramenta para consultar o dado desta tela, diga isso. Não invente o motivo.");
        return text.toString();
    }

    private static boolean menuMentions(String menu, String token) {
        return menu != null && menu.toLowerCase(java.util.Locale.ROOT).contains(token);
    }

    static String cleanUserName(String raw) {
        if (!StringUtils.hasText(raw)) {
            return "";
        }
        String token = raw.trim().split("\\s+")[0];
        if (token.length() > 40) {
            token = token.substring(0, 40);
        }
        if (!token.matches("[\\p{L}][\\p{L}'’.-]{0,39}")) {
            return "";
        }
        return token;
    }
}
