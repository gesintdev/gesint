package br.com.gesint.modules.root.assistant.knowledge;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AssistantContextSelectorTest {

    private final AssistantContextSelector selector = new AssistantContextSelector();

    @Test
    void deadlineQuestionWithCpfIsDiagnosedInsteadOfAPlainLookup() {
        String message =
                "porque a colaboradora de cpf 123.456.789-09 está com status PRAZO VENCIDO "
                        + "na Esteira de admissão. Lá diz ASO em atraso, mas coloquei as datas pra amanhã";

        assertThat(selector.hasCpfNumber(message)).isTrue();
        assertThat(selector.isAdmissionDeadlineQuestion(message)).isTrue();
        assertThat(selector.mentionsAdmissionPerson(message)).isTrue();
        assertThat(selector.looksLikeCpfLookup(message)).isTrue();
    }

    @Test
    void plainCpfLookupIsNotAnAdmissionDeadlineQuestion() {
        String message = "me mostra o cadastro do cpf 123.456.789-09";

        assertThat(selector.hasCpfNumber(message)).isTrue();
        assertThat(selector.looksLikeCpfLookup(message)).isTrue();
        assertThat(selector.isAdmissionDeadlineQuestion(message)).isFalse();
    }

    @Test
    void genericAsoQuestionHasNoPersonAndNoCpfNumber() {
        String message = "por que a esteira mostra ASO em atraso?";

        assertThat(selector.isAdmissionDeadlineQuestion(message)).isTrue();
        assertThat(selector.mentionsAdmissionPerson(message)).isFalse();
        assertThat(selector.hasCpfNumber(message)).isFalse();
        assertThat(selector.needsModuleGuidance(message)).isTrue();
    }
}
