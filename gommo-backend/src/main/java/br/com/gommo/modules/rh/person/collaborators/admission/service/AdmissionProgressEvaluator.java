package br.com.gommo.modules.rh.person.collaborators.admission.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProgress;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;

public final class AdmissionProgressEvaluator {

    public static final int REQUIRED_STEP_COUNT = 6;

    private AdmissionProgressEvaluator() {}

    public static AdmissionProgress evaluate(AdmissionProcess entity, long documentCount, long contractDocumentCount) {
        List<String> completedStepIds = new ArrayList<>(REQUIRED_STEP_COUNT);
        if (isDadosBasicosComplete(entity)) {
            completedStepIds.add("dados-basicos");
        }
        if (hasValidEmergencyContacts(entity)) {
            completedStepIds.add("contatos-emergencia");
        }
        if (isEnderecoComplete(entity)) {
            completedStepIds.add("endereco");
        }
        if (documentCount > 0) {
            completedStepIds.add("documentos");
        }
        if (isVinculoComplete(entity)) {
            completedStepIds.add("vinculo");
        }
        if (isContratoComplete(entity, contractDocumentCount)) {
            completedStepIds.add("contrato");
        }

        int completedStepCount = completedStepIds.size();
        AdmissionStatusEnum status = completedStepCount == REQUIRED_STEP_COUNT
                ? AdmissionStatusEnum.COMPLETED
                : AdmissionStatusEnum.IN_PROGRESS;
        return new AdmissionProgress(status, completedStepCount, REQUIRED_STEP_COUNT, List.copyOf(completedStepIds));
    }

    public static AdmissionStatusEnum resolveStatus(
            AdmissionProcess entity, long documentCount, long contractDocumentCount) {
        return evaluate(entity, documentCount, contractDocumentCount).status();
    }

    private static boolean isDadosBasicosComplete(AdmissionProcess entity) {
        return hasText(entity.getFullName()) && hasText(entity.getCpf()) && entity.getBirthDate() != null;
    }

    private static boolean isEnderecoComplete(AdmissionProcess entity) {
        return hasText(entity.getZipCode())
                && hasText(entity.getStreet())
                && hasText(entity.getNumber())
                && entity.getCity() != null
                && entity.getState() != null;
    }

    private static boolean isContratoComplete(AdmissionProcess entity, long contractDocumentCount) {
        return entity.getContractStartDate() != null && contractDocumentCount > 0;
    }

    private static boolean isVinculoComplete(AdmissionProcess entity) {
        if (entity.getExpectedStartDate() == null || entity.getContractType() == null) {
            return false;
        }
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
