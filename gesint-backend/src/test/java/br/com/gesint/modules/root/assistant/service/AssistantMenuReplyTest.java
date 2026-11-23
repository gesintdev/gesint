package br.com.gesint.modules.root.assistant.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogComplexity;
import br.com.gesint.modules.root.assistant.knowledge.AssistantCatalogItem;
import br.com.gesint.modules.root.assistant.knowledge.AssistantContextSelector;

class AssistantMenuReplyTest {

    private final AssistantContextSelector selector = new AssistantContextSelector();

    @Test
    void openingExplainsTheMenuWithoutTellingHowToFindIt() {
        AssistantChatResponseDto reply = AssistantMenuReply.build(experience(), "Experiência", "Administrador", true);

        assertThat(reply.getReply()).startsWith("Olá, Administrador.");
        assertThat(reply.getReply()).contains("serve para acompanhar período de experiência");
        assertThat(reply.getReply()).contains("fila de acompanhamento");
        assertThat(reply.getReply()).contains("Na tela:");
        assertThat(reply.getReply()).contains("Use a aba Em período");
        assertThat(reply.getReply()).doesNotContain("siga este caminho");
        assertThat(reply.getReply()).doesNotContain("Abra o sistema");
        assertThat(reply.getReply()).doesNotContain("Acesse Experiência");
        assertThat(reply.getLinks()).extracting("label").containsExactly("Abrir Experiência");
    }

    @Test
    void followUpAboutPurposeStaysOnTheSameMenu() {
        assertThat(selector.asksAboutFocusedMenu("pra que serve?")).isTrue();
        assertThat(selector.asksAboutFocusedMenu("quantos estão em experiência?")).isFalse();

        AssistantChatResponseDto reply = AssistantMenuReply.build(experience(), "Experiência", "Administrador", false);

        assertThat(reply.getReply()).doesNotContain("Olá");
        assertThat(reply.getReply()).contains("serve para acompanhar período de experiência");
        assertThat(reply.getReply()).doesNotContain("Abra o sistema");
    }

    @Test
    void followUpContextTellsTheModelNotToReciteThePath() {
        String context = AssistantMenuReply.modelContext(experience(), "Experiência");

        assertThat(context).contains("já sabe onde ele fica");
        assertThat(context).contains("Não monte o roteiro");
        assertThat(context).contains("fila de acompanhamento");
        assertThat(context).doesNotContain("Abra o sistema");
    }

    private static AssistantCatalogItem experience() {
        return AssistantCatalogItem.builder()
                .id("rh-experience")
                .system("RH")
                .menu("Experiência")
                .topic("Avaliação de experiência")
                .action("Acompanhar período de experiência")
                .href("/experience")
                .routeId("experience")
                .complexity(AssistantCatalogComplexity.GUIDE_ONLY)
                .guidance(List.of("Essa tela é uma fila de acompanhamento, não um cadastro manual."))
                .steps(List.of(
                        "Abra o sistema RH.",
                        "Acesse Experiência.",
                        "Use a aba Em período para quem ainda está em avaliação."))
                .build();
    }
}
