package br.com.gommo.modules.rh.person.exitinterview.mapper;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewResponseDto;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterview;

@Component
public class ExitInterviewMapper {
    public ExitInterview toEntity(ExitInterviewRequestDto dto) {
        return ExitInterview.builder()
                .collaboratorId(dto.getCollaboratorId())
                .interviewDate(dto.getInterviewDate())
                .departureReason(dto.getDepartureReason())
                .feedback(dto.getFeedback())
                .wouldRecommend(dto.getWouldRecommend())
                .interviewStatus(dto.getInterviewStatus())
                .relationshipType(dto.getRelationshipType())
                .collaboratorName(dto.getCollaboratorName())
                .registrationNumber(dto.getRegistrationNumber())
                .jobPositionName(dto.getJobPositionName())
                .jobPositionId(dto.getJobPositionId())
                .departmentName(dto.getDepartmentName())
                .departmentId(dto.getDepartmentId())
                .companyName(dto.getCompanyName())
                .managerName(dto.getManagerName())
                .admissionOrContractStartDate(dto.getAdmissionOrContractStartDate())
                .terminationOrContractEndDate(dto.getTerminationOrContractEndDate())
                .tenureDays(dto.getTenureDays())
                .terminationType(dto.getTerminationType())
                .interviewerName(dto.getInterviewerName())
                .mainReason(dto.getMainReason())
                .secondaryReasons(dto.getSecondaryReasons() == null ? new ArrayList<>() : dto.getSecondaryReasons())
                .detailedReason(dto.getDetailedReason())
                .ratings(dto.getRatings() == null ? new ArrayList<>() : dto.getRatings())
                .openAnswers(dto.getOpenAnswers() == null ? new ArrayList<>() : dto.getOpenAnswers())
                .wouldReturn(dto.getWouldReturn())
                .companyWouldRehire(dto.getCompanyWouldRehire())
                .rehireNotes(dto.getRehireNotes())
                .returnChecklist(dto.getReturnChecklist() == null ? new ArrayList<>() : dto.getReturnChecklist())
                .templateKey(dto.getTemplateKey())
                .templateVersion(dto.getTemplateVersion())
                .templatePayload(dto.getTemplatePayload() == null ? Map.of() : dto.getTemplatePayload())
                .build();
    }

    public void updateEntity(ExitInterview entity, ExitInterviewRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setInterviewDate(dto.getInterviewDate());
        entity.setDepartureReason(dto.getDepartureReason());
        entity.setFeedback(dto.getFeedback());
        entity.setWouldRecommend(dto.getWouldRecommend());
        entity.setInterviewStatus(dto.getInterviewStatus());
        entity.setRelationshipType(dto.getRelationshipType());
        entity.setCollaboratorName(dto.getCollaboratorName());
        entity.setRegistrationNumber(dto.getRegistrationNumber());
        entity.setJobPositionName(dto.getJobPositionName());
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setDepartmentName(dto.getDepartmentName());
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setCompanyName(dto.getCompanyName());
        entity.setManagerName(dto.getManagerName());
        entity.setAdmissionOrContractStartDate(dto.getAdmissionOrContractStartDate());
        entity.setTerminationOrContractEndDate(dto.getTerminationOrContractEndDate());
        entity.setTenureDays(dto.getTenureDays());
        entity.setTerminationType(dto.getTerminationType());
        entity.setInterviewerName(dto.getInterviewerName());
        entity.setMainReason(dto.getMainReason());
        entity.setSecondaryReasons(dto.getSecondaryReasons() == null ? new ArrayList<>() : dto.getSecondaryReasons());
        entity.setDetailedReason(dto.getDetailedReason());
        entity.setRatings(dto.getRatings() == null ? new ArrayList<>() : dto.getRatings());
        entity.setOpenAnswers(dto.getOpenAnswers() == null ? new ArrayList<>() : dto.getOpenAnswers());
        entity.setWouldReturn(dto.getWouldReturn());
        entity.setCompanyWouldRehire(dto.getCompanyWouldRehire());
        entity.setRehireNotes(dto.getRehireNotes());
        entity.setReturnChecklist(dto.getReturnChecklist() == null ? new ArrayList<>() : dto.getReturnChecklist());
        entity.setTemplateKey(dto.getTemplateKey());
        entity.setTemplateVersion(dto.getTemplateVersion());
        entity.setTemplatePayload(dto.getTemplatePayload() == null ? Map.of() : dto.getTemplatePayload());
    }

    public ExitInterviewResponseDto toResponse(ExitInterview entity) {
        return ExitInterviewResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .interviewDate(entity.getInterviewDate())
                .departureReason(entity.getDepartureReason())
                .feedback(entity.getFeedback())
                .wouldRecommend(entity.getWouldRecommend())
                .interviewStatus(entity.getInterviewStatus())
                .relationshipType(entity.getRelationshipType())
                .collaboratorName(entity.getCollaboratorName())
                .registrationNumber(entity.getRegistrationNumber())
                .jobPositionName(entity.getJobPositionName())
                .jobPositionId(entity.getJobPositionId())
                .departmentName(entity.getDepartmentName())
                .departmentId(entity.getDepartmentId())
                .companyName(entity.getCompanyName())
                .managerName(entity.getManagerName())
                .admissionOrContractStartDate(entity.getAdmissionOrContractStartDate())
                .terminationOrContractEndDate(entity.getTerminationOrContractEndDate())
                .tenureDays(entity.getTenureDays())
                .terminationType(entity.getTerminationType())
                .interviewerName(entity.getInterviewerName())
                .mainReason(entity.getMainReason())
                .secondaryReasons(entity.getSecondaryReasons())
                .detailedReason(entity.getDetailedReason())
                .ratings(entity.getRatings())
                .openAnswers(entity.getOpenAnswers())
                .wouldReturn(entity.getWouldReturn())
                .companyWouldRehire(entity.getCompanyWouldRehire())
                .rehireNotes(entity.getRehireNotes())
                .returnChecklist(entity.getReturnChecklist())
                .templateKey(entity.getTemplateKey())
                .templateVersion(entity.getTemplateVersion())
                .templatePayload(entity.getTemplatePayload())
                .completedAt(entity.getCompletedAt())
                .canceledAt(entity.getCanceledAt())
                .cancelReason(entity.getCancelReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
