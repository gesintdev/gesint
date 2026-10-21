package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

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
public class AdmissionPipelineDeadlineDto {

    private UUID admissionId;
    private String fullName;
    private AdmissionPipelineDeadlineKindEnum kind;
    private LocalDate dueDate;
    private LocalDate expectedStartDate;

    /** Negativo quando vencido. Alimenta o rotulo "-24d" do painel. */
    private int daysFromToday;

    private boolean overdue;
}
