package br.com.gommo.modules.dp.payment.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.dp.payment.service.PaymentNameMatcher.MatchType;
import br.com.gommo.modules.dp.payment.service.PaymentNameMatcher.NamedCollaborator;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;

class PaymentNameMatcherTest {

    private final PaymentNameMatcher matcher = new PaymentNameMatcher();

    @Test
    void fuzzyMatchesMinorSpellingDifference() {
        UUID collaboratorId = UUID.randomUUID();
        Collaborator collaborator = Collaborator.builder()
                .id(collaboratorId)
                .fullName("Felipe Francesco Tavolaroz da Luz")
                .build();
        List<NamedCollaborator> candidates = List.of(new NamedCollaborator(
                collaborator, List.of("felipe francesco tavolaroz da luz", "felipe francesco tavolaroz luz")));

        var result = matcher.match("Felipe Francesco Tavolaro Da Luz", Map.of(), candidates);

        assertEquals(MatchType.FUZZY, result.type());
        assertEquals(collaboratorId, result.collaborator().getId());
    }

    @Test
    void exactMatchHasPriority() {
        UUID collaboratorId = UUID.randomUUID();
        Collaborator collaborator = Collaborator.builder()
                .id(collaboratorId)
                .fullName("Abel Silva Lima")
                .build();
        Map<String, Collaborator> index = Map.of("abel silva lima", collaborator);
        List<NamedCollaborator> candidates = List.of(new NamedCollaborator(collaborator, List.of("abel silva lima")));

        var result = matcher.match("ABEL SILVA LIMA", index, candidates);

        assertEquals(MatchType.EXACT, result.type());
    }

    @Test
    void unrelatedNameIsNotFound() {
        UUID collaboratorId = UUID.randomUUID();
        Collaborator collaborator = Collaborator.builder()
                .id(collaboratorId)
                .fullName("Joao Vitor Junqueira Arantes")
                .build();
        List<NamedCollaborator> candidates =
                List.of(new NamedCollaborator(collaborator, List.of("joao vitor junqueira arantes")));

        var result = matcher.match("Joao Vitor Junqueira Fontes", Map.of(), candidates);

        assertEquals(MatchType.NONE, result.type());
    }

    @Test
    void doesNotMatchOnlySharedFirstName() {
        UUID flavioHenriqueId = UUID.randomUUID();
        UUID flavioAraujoId = UUID.randomUUID();
        Collaborator flavioHenrique = Collaborator.builder()
                .id(flavioHenriqueId)
                .fullName("Flavio Henrique")
                .build();
        Collaborator flavioAraujo = Collaborator.builder()
                .id(flavioAraujoId)
                .fullName("Flavio Araujo dos Santos")
                .build();
        Map<String, Collaborator> index = Map.of(
                "flavio henrique", flavioHenrique,
                "flavio araujo dos santos", flavioAraujo);
        List<NamedCollaborator> candidates = List.of(
                new NamedCollaborator(flavioHenrique, List.of("flavio henrique")),
                new NamedCollaborator(flavioAraujo, List.of("flavio araujo dos santos", "flavio araujo santos")));

        var result = matcher.match("FLAVIO ARAUJO DOS SANTOS", index, candidates);

        assertEquals(MatchType.EXACT, result.type());
        assertEquals(flavioAraujoId, result.collaborator().getId());
    }
}
