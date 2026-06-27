package br.com.gommo.modules.dp.payment.service;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;

class PaymentCollaboratorResolverTest {

    @Test
    void matchesNameWhenJobTitleIsAppended() {
        UUID collaboratorId = UUID.randomUUID();
        Collaborator collaborator = Collaborator.builder()
                .id(collaboratorId)
                .fullName("Abel Silva Lima")
                .build();
        Map<String, Collaborator> index = Map.of("abel silva lima", collaborator);

        assertTrue(new PaymentCollaboratorResolver(null, null, null)
                .findByExactName(index, "ABEL SILVA LIMA ARMADOR")
                .isPresent());
    }

    @Test
    void buildsNormalizedCandidatesIncludesShortenedForms() {
        List<String> candidates =
                PaymentCollaboratorResolver.normalizedNameCandidates("  ABEL   SILVA  LIMA  ARMADOR ");

        assertTrue(candidates.contains("abel silva lima armador"));
        assertTrue(candidates.contains("abel silva lima"));
        assertTrue(candidates.contains("abel silva"));
    }
}
