package br.com.gesint.modules.rh.person.collaborators.admission.dto;

import java.util.List;

import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;

public record AdmissionProgress(
        AdmissionStatusEnum status, int completedStepCount, int requiredStepCount, List<String> completedStepIds) {}
