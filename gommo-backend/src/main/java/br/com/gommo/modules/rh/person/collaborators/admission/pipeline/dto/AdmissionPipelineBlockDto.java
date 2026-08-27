package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionPipelineBlockDto {

    private UUID admissionId;
    private String fullName;
    private AdmissionPipelineBlockReasonEnum reason;
    private LocalDate expectedStartDate;
    private LocalDate examScheduledDate;
}
