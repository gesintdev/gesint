package br.com.gommo.modules.rh.person.leave.dto;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VacationEligibleCollaboratorDto {
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final String cpf;
    private final UUID photoObjectId;
    private final LocalDate hireDate;
    private final ContractTypeEnum contractType;
    private final String periodStatus;
    private final Integer entitledDays;
    private final Integer unjustifiedAbsences;
    private final Integer justifiedAbsences;
    private final LocalDate acquisitionStart;
    private final LocalDate acquisitionEnd;
    private final LocalDate concessiveStart;
    private final LocalDate concessiveEnd;
}
