package br.com.gommo.modules.benefitenrollment.mapper;
import br.com.gommo.modules.benefitenrollment.dto.*;
import br.com.gommo.modules.benefitenrollment.entity.BenefitEnrollment;
import org.springframework.stereotype.Component;
@Component public class BenefitEnrollmentMapper {
    public BenefitEnrollment toEntity(BenefitEnrollmentRequestDto dto) {
        return BenefitEnrollment.builder().collaboratorId(dto.getCollaboratorId())
            .benefitPlanId(dto.getBenefitPlanId()).startDate(dto.getStartDate()).endDate(dto.getEndDate())
            .monthlyValue(dto.getMonthlyValue()).notes(dto.getNotes()).build();
    }
    public void updateEntity(BenefitEnrollment entity, BenefitEnrollmentRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setBenefitPlanId(dto.getBenefitPlanId());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setMonthlyValue(dto.getMonthlyValue());
        entity.setNotes(dto.getNotes());
    }
    public BenefitEnrollmentResponseDto toResponse(BenefitEnrollment entity) {
        return BenefitEnrollmentResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).benefitPlanId(entity.getBenefitPlanId())
            .startDate(entity.getStartDate()).endDate(entity.getEndDate()).monthlyValue(entity.getMonthlyValue())
            .notes(entity.getNotes()).createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
