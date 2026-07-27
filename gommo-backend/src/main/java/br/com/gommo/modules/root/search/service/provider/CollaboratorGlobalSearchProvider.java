package br.com.gommo.modules.root.search.service.provider;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.dto.GlobalSearchItemDto;
import br.com.gommo.modules.root.search.service.GlobalSearchProvider;

@Component
public class CollaboratorGlobalSearchProvider implements GlobalSearchProvider {

    public static final String HREF = "/collaborator/people";

    private final CollaboratorRepository collaboratorRepository;
    private final OffboardingRepository offboardingRepository;
    private final AppUserRepository appUserRepository;

    public CollaboratorGlobalSearchProvider(
            CollaboratorRepository collaboratorRepository,
            OffboardingRepository offboardingRepository,
            AppUserRepository appUserRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.offboardingRepository = offboardingRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public SearchDocumentType getType() {
        return SearchDocumentType.PERSON;
    }

    @Override
    public String getLabel() {
        return "Pessoas";
    }

    @Override
    public String requiredAuthority() {
        return "collaborator:read";
    }

    @Override
    public List<GlobalSearchItemDto> search(String query, int limit) {
        String pattern = TextSearchUtils.toLikePattern(query);
        if (pattern == null) {
            return List.of();
        }
        Set<UUID> hiddenIds = hiddenCollaboratorIds();
        return collaboratorRepository
                .searchForGlobal(StatusEnum.DELETED, pattern, PageRequest.of(0, Math.max(limit * 3, limit)))
                .stream()
                .filter(c -> !hiddenIds.contains(c.getId()))
                .limit(limit)
                .map(this::toItem)
                .toList();
    }

    private GlobalSearchItemDto toItem(Collaborator collaborator) {
        String displayName = collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                ? collaborator.getSocialName()
                : collaborator.getFullName();
        return GlobalSearchItemDto.builder()
                .id(collaborator.getId())
                .title(displayName)
                .subtitle(formatCpfLabel(collaborator.getCpf()))
                .href(HREF)
                .build();
    }

    private Set<UUID> hiddenCollaboratorIds() {
        Set<UUID> hidden = new HashSet<>(offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED));
        hidden.addAll(appUserRepository.findCollaboratorIdsLinkedToSystemAdmin(StatusEnum.DELETED));
        return hidden;
    }

    public static String formatCpfLabel(String cpf) {
        if (cpf == null) {
            return "Colaborador";
        }
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11) {
            return digits.isBlank() ? "Colaborador" : "CPF " + digits;
        }
        return "CPF " + digits.substring(0, 3) + "." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-"
                + digits.substring(9);
    }
}
