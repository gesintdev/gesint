package br.com.gommo.modules.rh.person.contract.recess.service;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.stereotype.Service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.exception.AdmissionProcessException;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.recess.entity.*;
import br.com.gommo.modules.rh.person.contract.recess.repository.*;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;

@Service
public class ContractRecessProvisioningService {
    private final EmploymentContractRepository contractRepository;
    private final ContractRecessPolicyRepository policyRepository;
    private final ContractRecessPeriodRepository periodRepository;

    public ContractRecessProvisioningService(
            EmploymentContractRepository contractRepository,
            ContractRecessPolicyRepository policyRepository,
            ContractRecessPeriodRepository periodRepository) {
        this.contractRepository = contractRepository;
        this.policyRepository = policyRepository;
        this.periodRepository = periodRepository;
    }

    public void sync(AdmissionProcess admission) {
        validate(admission);
        LocalDate startDate = admission.getContractStartDate() != null
                ? admission.getContractStartDate()
                : admission.getExpectedStartDate();
        EmploymentContract contract = contractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                        admission.getCollaboratorId(), StatusEnum.DELETED)
                .orElseGet(() -> EmploymentContract.builder()
                        .collaboratorId(admission.getCollaboratorId())
                        .status(StatusEnum.ACTIVE)
                        .build());
        contract.setCompanyId(admission.getCompanyId());
        contract.setJobPositionId(admission.getJobPositionId());
        contract.setContractType(admission.getContractType());
        contract.setStartDate(startDate);
        contract.setEndDate(admission.getContractEndDate());
        contract.setBaseSalary(admission.getBaseSalary());
        contract = contractRepository.save(contract);

        if (admission.getContractType() != br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum.PJ) {
            return;
        }
        ContractRecessPolicy current = policyRepository
                .findEffective(contract.getId(), startDate, StatusEnum.DELETED)
                .orElse(null);
        if (samePolicy(current, admission)) {
            ensureFirstPeriod(current, admission, startDate);
            return;
        }
        if (current != null) {
            current.setEffectiveUntil(startDate.minusDays(1));
            policyRepository.save(current);
        }
        ContractRecessPolicy policy = ContractRecessPolicy.builder()
                .status(StatusEnum.ACTIVE)
                .employmentContractId(contract.getId())
                .enabled(admission.isRecessEnabled())
                .totalDaysPerCycle(admission.getRecessTotalDaysPerCycle())
                .cycleMonths(admission.getRecessCycleMonths())
                .eligibilityAfterMonths(admission.getRecessEligibilityAfterMonths())
                .financialMode(admission.getRecessFinancialMode())
                .paidPercentage(admission.getRecessPaidPercentage())
                .allowSplit(admission.isRecessAllowSplit())
                .maxSplitPeriods(admission.getRecessMaxSplitPeriods())
                .minimumSplitDays(admission.getRecessMinimumSplitDays())
                .advanceNoticeDays(admission.getRecessAdvanceNoticeDays())
                .effectiveFrom(startDate)
                .notes(admission.getRecessNotes())
                .build();
        policy = policyRepository.save(policy);
        ensureFirstPeriod(policy, admission, startDate);
    }

    private void validate(AdmissionProcess admission) {
        if (!admission.isRecessEnabled()) return;
        boolean invalid = admission.getRecessTotalDaysPerCycle() == null
                || admission.getRecessTotalDaysPerCycle() <= 0
                || admission.getRecessCycleMonths() == null
                || admission.getRecessCycleMonths() <= 0
                || admission.getRecessEligibilityAfterMonths() == null
                || admission.getRecessEligibilityAfterMonths() < 0
                || admission.getRecessFinancialMode() == null
                || admission.getRecessAdvanceNoticeDays() < 0
                || (admission.getRecessFinancialMode() == RecessFinancialModeEnum.PROPORTIONAL
                        && (admission.getRecessPaidPercentage() == null
                                || admission.getRecessPaidPercentage().signum() < 0
                                || admission.getRecessPaidPercentage().compareTo(java.math.BigDecimal.valueOf(100))
                                        > 0))
                || (admission.isRecessAllowSplit()
                        && (admission.getRecessMaxSplitPeriods() == null
                                || admission.getRecessMaxSplitPeriods() <= 1
                                || admission.getRecessMinimumSplitDays() == null
                                || admission.getRecessMinimumSplitDays() <= 0));
        if (invalid) throw AdmissionProcessException.pjRecessInvalid();
    }

    private void ensureFirstPeriod(ContractRecessPolicy policy, AdmissionProcess admission, LocalDate startDate) {
        if (policy == null || !policy.isEnabled()) return;
        periodRepository
                .findByPolicyIdAndCycleStartAndStatusNot(policy.getId(), startDate, StatusEnum.DELETED)
                .orElseGet(() -> periodRepository.save(ContractRecessPeriod.builder()
                        .status(StatusEnum.ACTIVE)
                        .policyId(policy.getId())
                        .collaboratorId(admission.getCollaboratorId())
                        .cycleStart(startDate)
                        .cycleEnd(startDate.plusMonths(policy.getCycleMonths()).minusDays(1))
                        .entitledDays(policy.getTotalDaysPerCycle())
                        .usedDays(0)
                        .reservedDays(0)
                        .periodStatus(
                                LocalDate.now().isBefore(startDate.plusMonths(policy.getEligibilityAfterMonths()))
                                        ? RecessPeriodStatusEnum.ACCRUING
                                        : RecessPeriodStatusEnum.AVAILABLE)
                        .build()));
    }

    private boolean samePolicy(ContractRecessPolicy policy, AdmissionProcess admission) {
        return policy != null
                && policy.isEnabled() == admission.isRecessEnabled()
                && Objects.equals(policy.getTotalDaysPerCycle(), admission.getRecessTotalDaysPerCycle())
                && Objects.equals(policy.getCycleMonths(), admission.getRecessCycleMonths())
                && Objects.equals(policy.getEligibilityAfterMonths(), admission.getRecessEligibilityAfterMonths())
                && policy.getFinancialMode() == admission.getRecessFinancialMode()
                && Objects.equals(policy.getPaidPercentage(), admission.getRecessPaidPercentage())
                && policy.isAllowSplit() == admission.isRecessAllowSplit()
                && Objects.equals(policy.getMaxSplitPeriods(), admission.getRecessMaxSplitPeriods())
                && Objects.equals(policy.getMinimumSplitDays(), admission.getRecessMinimumSplitDays())
                && policy.getAdvanceNoticeDays() == admission.getRecessAdvanceNoticeDays()
                && Objects.equals(policy.getNotes(), admission.getRecessNotes());
    }
}
