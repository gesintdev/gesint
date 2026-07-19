package br.com.gommo.modules.rh.person.jobvacancy.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;

@Component
public class JobVacancyMapper {
    public JobVacancy toEntity(JobVacancyRequestDto dto) {
        return JobVacancy.builder()
                .jobPositionId(dto.getJobPositionId())
                .jobTitle(requireTitle(dto.getJobTitle()))
                .positionsCount(dto.getPositionsCount())
                .description(trimToNull(dto.getDescription()))
                .activities(trimToNull(dto.getActivities()))
                .assignments(trimToNull(dto.getAssignments()))
                .seniorityLevel(dto.getSeniorityLevel())
                .expectedCompletionDate(dto.getExpectedCompletionDate())
                .targetBoards(copyBoards(dto.getTargetBoards()))
                .build();
    }

    public void updateEntity(JobVacancy entity, JobVacancyRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setJobTitle(requireTitle(dto.getJobTitle()));
        entity.setPositionsCount(dto.getPositionsCount());
        entity.setDescription(trimToNull(dto.getDescription()));
        entity.setActivities(trimToNull(dto.getActivities()));
        entity.setAssignments(trimToNull(dto.getAssignments()));
        entity.setSeniorityLevel(dto.getSeniorityLevel());
        entity.setExpectedCompletionDate(dto.getExpectedCompletionDate());
        entity.setTargetBoards(copyBoards(dto.getTargetBoards()));
    }

    public JobVacancyResponseDto toResponse(JobVacancy entity) {
        return JobVacancyResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobPositionId(entity.getJobPositionId())
                .jobTitle(entity.getJobTitle())
                .positionsCount(entity.getPositionsCount())
                .description(entity.getDescription())
                .activities(entity.getActivities())
                .assignments(entity.getAssignments())
                .seniorityLevel(entity.getSeniorityLevel())
                .expectedCompletionDate(entity.getExpectedCompletionDate())
                .targetBoards(copyBoards(entity.getTargetBoards()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static List<String> copyBoards(List<String> boards) {
        if (boards == null || boards.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(boards);
    }

    private static String requireTitle(String value) {
        return value == null ? "" : value.trim();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
