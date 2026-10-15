package br.com.gommo.modules.rh.person.jobvacancy.mapper;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;

@Component
public class JobVacancyMapper {
    public JobVacancy toEntity(JobVacancyRequestDto dto) {
        JobVacancy entity = JobVacancy.builder()
                .jobPositionId(dto.getJobPositionId())
                .jobTitle(requireTitle(dto.getJobTitle()))
                .positionsCount(dto.getPositionsCount())
                .description(trimToNull(dto.getDescription()))
                .activities(trimToNull(dto.getActivities()))
                .assignments(trimToNull(dto.getAssignments()))
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
                .recruiterCollaboratorId(dto.getRecruiterCollaboratorId())
                .requestingManagerCollaboratorId(dto.getRequestingManagerCollaboratorId())
                .interviewerCollaboratorIds(copyCollaboratorIds(dto.getInterviewerCollaboratorIds()))
                .candidateReturnSlaBusinessDays(resolveSlaDays(dto.getCandidateReturnSlaBusinessDays()))
                .affirmativePcd(Boolean.TRUE.equals(dto.getAffirmativePcd()))
                .publishGoogleJobs(resolvePublishGoogleJobs(dto.getPublishGoogleJobs()))
                .build();
        applyRequirements(entity, dto);
        return entity;
    }

    public void updateEntity(JobVacancy entity, JobVacancyRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setJobTitle(requireTitle(dto.getJobTitle()));
        entity.setPositionsCount(dto.getPositionsCount());
        entity.setDescription(trimToNull(dto.getDescription()));
        entity.setActivities(trimToNull(dto.getActivities()));
        entity.setAssignments(trimToNull(dto.getAssignments()));
        applyRequirements(entity, dto);
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
        entity.setRecruiterCollaboratorId(dto.getRecruiterCollaboratorId());
        entity.setRequestingManagerCollaboratorId(dto.getRequestingManagerCollaboratorId());
        entity.setInterviewerCollaboratorIds(copyCollaboratorIds(dto.getInterviewerCollaboratorIds()));
        entity.setCandidateReturnSlaBusinessDays(resolveSlaDays(dto.getCandidateReturnSlaBusinessDays()));
        entity.setAffirmativePcd(Boolean.TRUE.equals(dto.getAffirmativePcd()));
        entity.setPublishGoogleJobs(resolvePublishGoogleJobs(dto.getPublishGoogleJobs()));
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
                .requirementItems(copyItems(entity.getRequirementItems()))
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
                .recruiterCollaboratorId(entity.getRecruiterCollaboratorId())
                .requestingManagerCollaboratorId(entity.getRequestingManagerCollaboratorId())
                .interviewerCollaboratorIds(copyCollaboratorIds(entity.getInterviewerCollaboratorIds()))
                .candidateReturnSlaBusinessDays(resolveSlaDays(entity.getCandidateReturnSlaBusinessDays()))
                .affirmativePcd(Boolean.TRUE.equals(entity.getAffirmativePcd()))
                .publishGoogleJobs(resolvePublishGoogleJobs(entity.getPublishGoogleJobs()))
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

    private static List<String> copyItems(List<String> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        return List.copyOf(items);
    }

    private static List<UUID> copyCollaboratorIds(List<UUID> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(source);
    }

    private static Integer resolveSlaDays(Integer value) {
        return value == null || value < 1 ? 5 : value;
    }

    private static boolean resolvePublishGoogleJobs(Boolean value) {
        return value == null || Boolean.TRUE.equals(value);
    }

    private void applyRequirements(JobVacancy entity, JobVacancyRequestDto dto) {
        List<String> items = resolveRequirementItems(dto);
        entity.setRequirementItems(new ArrayList<>(items));
        entity.setRequirements(items.isEmpty() ? trimToNull(dto.getRequirements()) : String.join("\n", items));
    }

    private List<String> resolveRequirementItems(JobVacancyRequestDto dto) {
        Set<String> items = new LinkedHashSet<>();
        if (dto.getRequirementItems() != null) {
            dto.getRequirementItems().stream()
                    .map(this::trimToNull)
                    .filter(value -> value != null)
                    .forEach(items::add);
        }
        if (items.isEmpty()) {
            splitRequirementText(dto.getRequirements()).forEach(items::add);
        }
        return new ArrayList<>(items);
    }

    private List<String> splitRequirementText(String requirements) {
        if (requirements == null || requirements.isBlank()) {
            return List.of();
        }
        List<String> items = new ArrayList<>();
        for (String line : requirements.split("[\\r\\n;]+")) {
            String trimmed = trimToNull(line);
            if (trimmed != null) {
                items.add(trimmed);
            }
        }
        return items;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String requireTitle(String value) {
        return value == null ? "" : value.trim();
    }

}
