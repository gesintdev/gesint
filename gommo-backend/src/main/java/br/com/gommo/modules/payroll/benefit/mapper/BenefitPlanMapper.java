package br.com.gommo.modules.payroll.benefit.mapper;
import br.com.gommo.modules.payroll.benefit.dto.*; import br.com.gommo.modules.payroll.benefit.entity.BenefitPlan; import org.springframework.stereotype.Component;
@Component public class BenefitPlanMapper {
    public BenefitPlan toEntity(BenefitPlanRequestDto dto) {
        return BenefitPlan.builder().name(dto.getName()).benefitType(dto.getBenefitType())
            .monthlyValue(dto.getMonthlyValue()).description(dto.getDescription())
            .startDate(dto.getStartDate()).endDate(dto.getEndDate()).build();
    }
    public void updateEntity(BenefitPlan entity, BenefitPlanRequestDto dto) {
        entity.setName(dto.getName()); entity.setBenefitType(dto.getBenefitType());
        entity.setMonthlyValue(dto.getMonthlyValue()); entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate()); entity.setEndDate(dto.getEndDate());
    }
    public BenefitPlanResponseDto toResponse(BenefitPlan entity) {
        return BenefitPlanResponseDto.builder().id(entity.getId()).code(entity.getCode()).status(entity.getStatus()).name(entity.getName())
            .benefitType(entity.getBenefitType()).monthlyValue(entity.getMonthlyValue()).description(entity.getDescription())
            .startDate(entity.getStartDate()).endDate(entity.getEndDate())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
