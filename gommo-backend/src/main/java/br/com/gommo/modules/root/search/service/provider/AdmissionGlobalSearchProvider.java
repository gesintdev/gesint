package br.com.gommo.modules.root.search.service.provider;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.dto.GlobalSearchItemDto;
import br.com.gommo.modules.root.search.service.GlobalSearchProvider;

@Component
public class AdmissionGlobalSearchProvider implements GlobalSearchProvider {

    public static final String HREF = "/collaborator/admission";

    private final AdmissionProcessRepository admissionProcessRepository;

    public AdmissionGlobalSearchProvider(AdmissionProcessRepository admissionProcessRepository) {
        this.admissionProcessRepository = admissionProcessRepository;
    }

    @Override
    public SearchDocumentType getType() {
        return SearchDocumentType.ADMISSION;
    }

    @Override
    public String getLabel() {
        return "Admissão";
    }

    @Override
    public String requiredAuthority() {
        return "admission:read";
    }

    @Override
    public List<GlobalSearchItemDto> search(String query, int limit) {
        String pattern = TextSearchUtils.toLikePattern(query);
        if (pattern == null) {
            return List.of();
        }
        return admissionProcessRepository
                .searchForGlobal(
                        StatusEnum.DELETED,
                        AdmissionStatusEnum.CANCELLED,
                        pattern,
                        PageRequest.of(0, limit))
                .stream()
                .map(this::toItem)
                .toList();
    }

    private GlobalSearchItemDto toItem(AdmissionProcess admission) {
        String displayName = admission.getSocialName() != null && !admission.getSocialName().isBlank()
                ? admission.getSocialName()
                : admission.getFullName();
        return GlobalSearchItemDto.builder()
                .id(admission.getId())
                .title(displayName)
                .subtitle(subtitle(admission))
                .href(HREF)
                .build();
    }

    public static String subtitle(AdmissionProcess admission) {
        String status = statusLabel(admission.getAdmissionStatus());
        String document = documentInfo(admission);
        if (document == null || document.isBlank()) {
            return status;
        }
        return status + " · " + document;
    }

    private static String documentInfo(AdmissionProcess admission) {
        String cpf = formatCpf(admission.getCpf());
        String cnpj = formatCnpj(admission.getProviderCnpj());
        boolean isPj = admission.getContractType() == ContractTypeEnum.PJ;
        if (isPj && cnpj != null) {
            if (cpf != null) {
                return "CPF " + cpf + " · CNPJ " + cnpj;
            }
            return "CNPJ " + cnpj;
        }
        if (cpf != null) {
            return "CPF " + cpf;
        }
        if (cnpj != null) {
            return "CNPJ " + cnpj;
        }
        return null;
    }

    private static String formatCpf(String cpf) {
        if (cpf == null) {
            return null;
        }
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11) {
            return digits.isBlank() ? null : digits;
        }
        return digits.substring(0, 3) + "." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-"
                + digits.substring(9);
    }

    private static String formatCnpj(String cnpj) {
        if (cnpj == null) {
            return null;
        }
        String digits = cnpj.replaceAll("\\D", "");
        if (digits.length() != 14) {
            return digits.isBlank() ? null : digits;
        }
        return digits.substring(0, 2) + "." + digits.substring(2, 5) + "." + digits.substring(5, 8) + "/"
                + digits.substring(8, 12) + "-" + digits.substring(12);
    }

    public static String statusLabel(AdmissionStatusEnum status) {
        if (status == null) {
            return "Admissão";
        }
        return switch (status) {
            case DRAFT -> "Rascunho";
            case IN_PROGRESS -> "Em andamento";
            case COMPLETED -> "Concluída";
            case CANCELLED -> "Cancelada";
        };
    }
}
