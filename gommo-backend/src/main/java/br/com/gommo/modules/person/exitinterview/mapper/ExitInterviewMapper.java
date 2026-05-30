package br.com.gommo.modules.person.exitinterview.mapper;
import br.com.gommo.modules.person.exitinterview.dto.*; import br.com.gommo.modules.person.exitinterview.entity.ExitInterview; import org.springframework.stereotype.Component;
@Component public class ExitInterviewMapper {
    public ExitInterview toEntity(ExitInterviewRequestDto dto) {
        return ExitInterview.builder().collaboratorId(dto.getCollaboratorId()).interviewDate(dto.getInterviewDate())
            .departureReason(dto.getDepartureReason()).feedback(dto.getFeedback()).wouldRecommend(dto.getWouldRecommend()).build();
    }
    public void updateEntity(ExitInterview entity, ExitInterviewRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId()); entity.setInterviewDate(dto.getInterviewDate());
        entity.setDepartureReason(dto.getDepartureReason()); entity.setFeedback(dto.getFeedback());
        entity.setWouldRecommend(dto.getWouldRecommend());
    }
    public ExitInterviewResponseDto toResponse(ExitInterview entity) {
        return ExitInterviewResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).interviewDate(entity.getInterviewDate())
            .departureReason(entity.getDepartureReason()).feedback(entity.getFeedback()).wouldRecommend(entity.getWouldRecommend())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
