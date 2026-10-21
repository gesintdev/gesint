package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionPipelineKpisDto {

    /** Admissoes com esteira aberta (nem concluida nem cancelada). */
    private int inProgress;

    private int startingWithinFifteenDays;

    /** Etapa do exame diferente de DONE com inicio previsto nos proximos 15 dias. */
    private int blockedFromStarting;

    private int overdueDeadlines;
    private int overdueDeadlinePeople;

    private int dueWithinSevenDays;
    private LocalDate nextDueDate;

    /** Seis etapas em DONE e colaborador criado. */
    private int readyForFirstDay;
}
