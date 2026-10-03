package br.com.gommo.modules.rh.person.jobvacancy.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.repository.JobPositionCompetencyRepository;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gommo.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;

@Service
public class JobVacancyRequirementOptionsService {

    private final JobVacancyRepository jobVacancyRepository;
    private final JobPositionCompetencyRepository jobPositionCompetencyRepository;
    private final CompetencyRepository competencyRepository;

    public JobVacancyRequirementOptionsService(
            JobVacancyRepository jobVacancyRepository,
            JobPositionCompetencyRepository jobPositionCompetencyRepository,
            CompetencyRepository competencyRepository) {
        this.jobVacancyRepository = jobVacancyRepository;
        this.jobPositionCompetencyRepository = jobPositionCompetencyRepository;
        this.competencyRepository = competencyRepository;
    }

    @Transactional(readOnly = true)
    public List<String> listForVacancy(UUID jobVacancyId) {
        JobVacancy vacancy = jobVacancyRepository
                .findByIdAndStatusNot(jobVacancyId, StatusEnum.DELETED)
                .orElse(null);
        if (vacancy == null) {
            return List.of();
        }
        return listForVacancy(vacancy);
    }

    @Transactional(readOnly = true)
    public List<String> listForVacancy(JobVacancy vacancy) {
        Set<String> options = new LinkedHashSet<>();
        if (vacancy.getRequirementItems() != null) {
            vacancy.getRequirementItems().stream()
                    .map(this::trimToNull)
                    .filter(value -> value != null)
                    .forEach(options::add);
        }
        appendLegacyRequirements(vacancy.getRequirements(), options);
        appendJobPositionCompetencies(vacancy.getJobPositionId(), options);
        return new ArrayList<>(options);
    }

    public boolean isAllowedRequirement(JobVacancy vacancy, String requirement) {
        String normalized = trimToNull(requirement);
        if (normalized == null) {
            return false;
        }
        return listForVacancy(vacancy).stream().anyMatch(option -> option.equalsIgnoreCase(normalized));
    }

    private void appendLegacyRequirements(String requirements, Set<String> options) {
        if (requirements == null || requirements.isBlank()) {
            return;
        }
        for (String line : requirements.split("[\\r\\n;]+")) {
            String trimmed = trimToNull(line);
            if (trimmed != null) {
                options.add(trimmed);
            }
        }
    }

    private void appendJobPositionCompetencies(UUID jobPositionId, Set<String> options) {
        if (jobPositionId == null) {
            return;
        }
        List<JobPositionCompetency> links =
                jobPositionCompetencyRepository.findByJobPositionIdOrdered(jobPositionId, StatusEnum.DELETED);
        Set<UUID> competencyIds = new LinkedHashSet<>();
        for (JobPositionCompetency link : links) {
            if (link.getValidUntil() != null) {
                continue;
            }
            competencyIds.add(link.getCompetencyId());
        }
        if (competencyIds.isEmpty()) {
            return;
        }
        for (Competency competency : competencyRepository.findAllById(competencyIds)) {
            if (competency.getStatus() == StatusEnum.DELETED) {
                continue;
            }
            String name = trimToNull(competency.getName());
            if (name != null) {
                options.add(name);
            }
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
