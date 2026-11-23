package br.com.gesint.modules.root.assistant.knowledge;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VacationListingQuestionTest {

    @Test
    void readsTheCollaboratorNameFromAVacationListingQuestion() {
        String message = "Porque o colaborador Flavio Henrique não aparece na listagem pra lançar ferias?";

        assertThat(VacationListingQuestion.matches(message, "Férias")).isTrue();
        assertThat(VacationListingQuestion.nameIn(message)).isEqualTo("Flavio Henrique");
    }

    @Test
    void readsANameWithoutTheCollaboratorWordWhenTheMenuIsVacation() {
        String message = "Porque o Flavio não aparece na listagem?";

        assertThat(VacationListingQuestion.matches(message, "Férias")).isTrue();
        assertThat(VacationListingQuestion.nameIn(message)).isEqualTo("Flavio");
    }

    @Test
    void ignoresTheMenuOpeningQuestion() {
        String message = "Para que serve este menu e o que posso fazer nele?";

        assertThat(VacationListingQuestion.matches(message, "Férias")).isFalse();
    }

    @Test
    void doesNotTreatATimeClockQuestionAsVacation() {
        String message = "porque o colaborador Flavio Henrique não aparece na consulta pra eu lançar ponto pra ele?";

        assertThat(VacationListingQuestion.matches(message, "Ponto")).isFalse();
        assertThat(VacationListingQuestion.matches(message, "Férias")).isFalse();
        assertThat(AttendanceListingQuestion.matches(message, "Ponto")).isTrue();
        assertThat(AttendanceListingQuestion.nameIn(message)).isEqualTo("Flavio Henrique");
    }

    @Test
    void asksAgainWhenTheQuestionDoesNotNameAnyone() {
        String message = "Porque o colaborador não aparece na listagem de férias?";

        assertThat(VacationListingQuestion.matches(message, "Férias")).isTrue();
        assertThat(VacationListingQuestion.nameIn(message)).isEmpty();
    }
}
