package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.CandidateAcceptanceEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationHireRequestDto {

    @NotNull private ContractTypeEnum contractType;

    @NotNull private LocalDate expectedStartDate;

    private BigDecimal baseSalary;

    private UUID workScheduleId;

    @NotNull private CandidateAcceptanceEnum candidateAcceptance;

    /** CPF pode ser informado na proposta se o candidato da pagina publica nao tiver. */
    @Size(max = 14)
    private String cpf;

    private LocalDate birthDate;

    @Size(max = 200)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank
    @Size(max = 80)
    private String columnKey;
}
