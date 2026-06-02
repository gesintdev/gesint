package br.com.gommo.modules.person.collaborators.admission.service;

import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

final class AdmissionProgressEvaluator {

    private AdmissionProgressEvaluator() {
    }

    static AdmissionStatusEnum resolveStatus(AdmissionProcess entity, long documentCount, long contractDocumentCount) {
        if (isComplete(entity, documentCount, contractDocumentCount)) {
            return AdmissionStatusEnum.COMPLETED;
        }
        return AdmissionStatusEnum.IN_PROGRESS;
    }

    private static boolean isComplete(AdmissionProcess entity, long documentCount, long contractDocumentCount) {
        return entity.getPhotoObjectId() != null
                && hasText(entity.getFullName())
                && hasText(entity.getCpf())
                && entity.getBirthDate() != null
                && hasValidEmergencyContacts(entity)
                && hasText(entity.getZipCode())
                && hasText(entity.getStreet())
                && hasText(entity.getNumber())
                && hasText(entity.getCity())
                && hasText(entity.getStateCode())
                && entity.getExpectedStartDate() != null
                && entity.getContractType() != null
                && isVinculoComplete(entity)
                && entity.getContractStartDate() != null
                && documentCount > 0
                && contractDocumentCount > 0;
    }

    private static boolean isVinculoComplete(AdmissionProcess entity) {
        if (entity.getContractType() == ContractTypeEnum.PJ) {
            return hasText(entity.getProviderCnpj())
                    && entity.getProviderCnpj().length() == 14
                    && hasText(entity.getProviderLegalName());
        }
        return hasText(entity.getWorkloadSchedule());
    }

    private static boolean hasValidEmergencyContacts(AdmissionProcess entity) {
        if (CollectionUtils.isEmpty(entity.getEmergencyContacts())) {
            return false;
        }
        return entity.getEmergencyContacts().stream()
                .anyMatch(contact -> hasText(contact.getName()) && hasText(contact.getPhone()));
    }

    private static boolean hasText(String value) {
        return StringUtils.hasText(value);
    }
}
