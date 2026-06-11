package br.com.gommo.modules.person.collaborators.admission.dto;

import java.util.List;

import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;

public record AdmissionProgress(
        AdmissionStatusEnum status,
        int completedStepCount,
        int requiredStepCount,
        List<String> completedStepIds) {}
