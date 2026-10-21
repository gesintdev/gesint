package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Uma linha da esteira. Os textos da tela sao compostos no frontend a partir destes campos: o
 * backend devolve o fato, nao a frase.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionPipelineRowDto {

    private UUID admissionId;
    private UUID collaboratorId;
    private UUID photoObjectId;
    private String fullName;
    private String departmentName;
    private LocalDate expectedStartDate;

    private List<AdmissionPipelineStepDto> steps;

    private AdmissionPipelineSignalEnum signal;

    /** True quando a admissao foi aprovada manualmente na esteira. */
    private boolean manuallyApproved;

    /** Positivo quando a data de inicio ja passou. Alimenta "iniciou ha N dias". */
    private Integer daysSinceExpectedStart;

    /** Data do exame agendado, quando a etapa esta bloqueada aguardando o ASO. */
    private LocalDate examScheduledDate;

    private LocalDate nextDueDate;
    private AdmissionPipelineDeadlineKindEnum nextDueKind;

    private long documentsReceived;
    private long documentsRequired;

    /** Quanto menor, mais urgente. Define a ordenacao da esteira. */
    private int urgencyRank;
}
