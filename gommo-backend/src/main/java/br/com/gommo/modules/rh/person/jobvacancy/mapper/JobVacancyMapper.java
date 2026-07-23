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
                .requirements(trimToNull(dto.getRequirements()))
                .benefits(trimToNull(dto.getBenefits()))
                .department(trimToNull(dto.getDepartment()))
                .location(trimToNull(dto.getLocation()))
                .workModality(dto.getWorkModality())
                .contractType(dto.getContractType())
                .workSchedule(trimToNull(dto.getWorkSchedule()))
                .seniorityLevel(dto.getSeniorityLevel())
                .salary(dto.getSalary())
                .salaryMax(dto.getSalaryMax())
                .expectedCompletionDate(dto.getExpectedCompletionDate())
                .targetBoards(copyBoards(dto.getTargetBoards()))
                .slug(trimToNull(dto.getSlug()))
                .isPublic(Boolean.TRUE.equals(dto.getIsPublic()))
                .build();
    }

    public void updateEntity(JobVacancy entity, JobVacancyRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setJobTitle(requireTitle(dto.getJobTitle()));
        entity.setPositionsCount(dto.getPositionsCount());
        entity.setDescription(trimToNull(dto.getDescription()));
        entity.setActivities(trimToNull(dto.getActivities()));
        entity.setAssignments(trimToNull(dto.getAssignments()));
        entity.setRequirements(trimToNull(dto.getRequirements()));
        entity.setBenefits(trimToNull(dto.getBenefits()));
        entity.setDepartment(trimToNull(dto.getDepartment()));
        entity.setLocation(trimToNull(dto.getLocation()));
        entity.setWorkModality(dto.getWorkModality());
        entity.setContractType(dto.getContractType());
        entity.setWorkSchedule(trimToNull(dto.getWorkSchedule()));
        entity.setSeniorityLevel(dto.getSeniorityLevel());
        entity.setSalary(dto.getSalary());
        entity.setSalaryMax(dto.getSalaryMax());
        entity.setExpectedCompletionDate(dto.getExpectedCompletionDate());
        entity.setTargetBoards(copyBoards(dto.getTargetBoards()));
        entity.setSlug(trimToNull(dto.getSlug()));
        entity.setIsPublic(Boolean.TRUE.equals(dto.getIsPublic()));
    }

    public JobVacancyResponseDto toResponse(JobVacancy entity) {
        return toResponse(entity, 0);
    }

    public JobVacancyResponseDto toResponse(JobVacancy entity, int candidateCount) {
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
                .requirements(entity.getRequirements())
                .benefits(entity.getBenefits())
                .department(entity.getDepartment())
                .location(entity.getLocation())
                .workModality(entity.getWorkModality())
                .contractType(entity.getContractType())
                .workSchedule(entity.getWorkSchedule())
                .seniorityLevel(entity.getSeniorityLevel())
                .salary(entity.getSalary())
                .salaryMax(entity.getSalaryMax())
                .expectedCompletionDate(entity.getExpectedCompletionDate())
                .targetBoards(copyBoards(entity.getTargetBoards()))
                .slug(entity.getSlug())
                .isPublic(Boolean.TRUE.equals(entity.getIsPublic()))
                .publishedAt(entity.getPublishedAt())
                .candidateCount(candidateCount)
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
