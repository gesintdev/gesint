package br.com.gommo.modules.payment.service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.person.collaborators.people.entity.CollaboratorContact;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorContactRepository;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.payment.pdf.PaymentReceiptPdfParser;
import br.com.gommo.modules.payment.service.PaymentNameMatcher.NamedCollaborator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PaymentCollaboratorResolver {

    private final CollaboratorRepository collaboratorRepository;
    private final CollaboratorContactRepository contactRepository;
    private final AdmissionProcessRepository admissionProcessRepository;

    public PaymentCollaboratorResolver(
            CollaboratorRepository collaboratorRepository,
            CollaboratorContactRepository contactRepository,
            AdmissionProcessRepository admissionProcessRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.contactRepository = contactRepository;
        this.admissionProcessRepository = admissionProcessRepository;
    }

    /**
     * Mesma origem do RH ({@code GET /api/v1/collaborators/admitted}): admissao concluida com colaborador vinculado.
     */
    public Map<String, Collaborator> buildNameIndex() {
        List<NamedCollaborator> candidates = buildNamedCandidates();
        Map<String, Collaborator> index = new HashMap<>();
        for (NamedCollaborator candidate : candidates) {
            for (String normalizedName : candidate.normalizedNames()) {
                index.putIfAbsent(normalizedName, candidate.collaborator());
            }
        }
        return index;
    }

    public List<NamedCollaborator> buildNamedCandidates() {
        List<AdmissionProcess> admissions = admissionProcessRepository
                .findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(
                        AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED);
        if (admissions.isEmpty()) {
            return List.of();
        }

        List<UUID> collaboratorIds = admissions.stream()
                .map(AdmissionProcess::getCollaboratorId)
                .distinct()
                .toList();
        Map<UUID, Collaborator> collaboratorsById = collaboratorRepository.findAllById(collaboratorIds).stream()
                .filter(collaborator -> collaborator.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Collaborator::getId, Function.identity()));

        Map<UUID, NamedCollaboratorBuilder> builders = new LinkedHashMap<>();
        for (AdmissionProcess admission : admissions) {
            Collaborator collaborator = collaboratorsById.get(admission.getCollaboratorId());
            if (collaborator == null) {
                continue;
            }
            NamedCollaboratorBuilder builder =
                    builders.computeIfAbsent(collaborator.getId(), id -> new NamedCollaboratorBuilder(collaborator));
            builder.addName(admission.getFullName());
            builder.addName(admission.getSocialName());
            builder.addName(collaborator.getFullName());
            builder.addName(collaborator.getSocialName());
        }
        return builders.values().stream().map(NamedCollaboratorBuilder::build).toList();
    }

    public Optional<Collaborator> findByExactName(Map<String, Collaborator> index, String extractedName) {
        if (extractedName == null || extractedName.isBlank() || index.isEmpty()) {
            return Optional.empty();
        }
        for (String candidate : normalizedNameCandidates(extractedName)) {
            Collaborator matched = index.get(candidate);
            if (matched != null) {
                return Optional.of(matched);
            }
        }
        return Optional.empty();
    }

    static List<String> normalizedNameCandidates(String extractedName) {
        String normalized = PaymentReceiptPdfParser.normalizeName(extractedName);
        if (normalized.isBlank()) {
            return List.of();
        }
        String comparison = PaymentPersonNameFormatter.normalizeForComparison(extractedName);
        String stripped = PaymentPersonNameFormatter.stripParticles(comparison);
        String[] tokens = normalized.split("\\s+");
        Set<String> candidates = new HashSet<>();
        int minimumLength = Math.min(tokens.length, PaymentNameMatcher.MIN_NAME_TOKENS_FOR_MATCH);
        for (int length = tokens.length; length >= minimumLength; length--) {
            StringBuilder builder = new StringBuilder();
            for (int index = 0; index < length; index++) {
                if (index > 0) {
                    builder.append(' ');
                }
                builder.append(tokens[index]);
            }
            candidates.add(builder.toString());
        }
        if (!comparison.isBlank()) {
            candidates.add(comparison);
        }
        if (!stripped.isBlank()) {
            candidates.add(stripped);
        }
        return new ArrayList<>(candidates);
    }

    public ContactInfo resolveContact(UUID collaboratorId) {
        Optional<CollaboratorContact> contact = contactRepository.findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(
                collaboratorId, StatusEnum.DELETED);
        String email = contact.map(CollaboratorContact::getEmail).orElse(null);
        String phone = contact.map(CollaboratorContact::getPhone).orElse(null);

        if ((email == null || email.isBlank()) || (phone == null || phone.isBlank())) {
            Optional<AdmissionProcess> admission = admissionProcessRepository
                    .findByCollaboratorIdAndStatusNot(collaboratorId, StatusEnum.DELETED);
            if (admission.isPresent()) {
                if (email == null || email.isBlank()) {
                    email = admission.get().getEmail();
                }
                if (phone == null || phone.isBlank()) {
                    phone = admission.get().getPhone();
                }
            }
        }
        return new ContactInfo(email, phone);
    }

    public Optional<Collaborator> findEntity(UUID collaboratorId) {
        return collaboratorRepository.findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED);
    }

    private static final class NamedCollaboratorBuilder {
        private final Collaborator collaborator;
        private final Set<String> normalizedNames = new HashSet<>();

        private NamedCollaboratorBuilder(Collaborator collaborator) {
            this.collaborator = collaborator;
        }

        private void addName(String name) {
            if (name == null || name.isBlank()) {
                return;
            }
            for (String candidate : normalizedNameCandidates(name)) {
                if (countTokens(candidate) >= PaymentNameMatcher.MIN_NAME_TOKENS_FOR_MATCH) {
                    normalizedNames.add(candidate);
                }
            }
        }

        private int countTokens(String value) {
            return value.isBlank() ? 0 : value.trim().split("\\s+").length;
        }

        private NamedCollaborator build() {
            return new NamedCollaborator(collaborator, List.copyOf(normalizedNames));
        }
    }

    public record ContactInfo(String email, String phone) {}
}
