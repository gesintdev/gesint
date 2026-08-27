package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepKeyEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity.AdmissionStepStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionPipelineStepDto {

    private AdmissionStepKeyEnum stepKey;
    private AdmissionStepStatusEnum stepStatus;
    private int displayOrder;
    private LocalDate dueDate;
    private boolean overdue;
    private String blockedReason;
    private String skipJustification;
}
