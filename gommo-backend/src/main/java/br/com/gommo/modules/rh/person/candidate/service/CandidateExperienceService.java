package br.com.gommo.modules.rh.person.candidate.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;
import br.com.gommo.modules.rh.person.candidate.entity.CandidateExperience;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateExperienceRepository;

@Service
public class CandidateExperienceService {

    private final CandidateExperienceRepository repository;

    public CandidateExperienceService(CandidateExperienceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CandidateExperienceDto> listByCandidateId(UUID candidateId) {
        return repository
                .findByCandidateIdAndStatusNotOrderByStartDateDesc(candidateId, StatusEnum.DELETED)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void replaceAll(UUID candidateId, List<CandidateExperienceDto> experiences) {
        List<CandidateExperience> existing =
                repository.findByCandidateIdAndStatusNotOrderByStartDateDesc(candidateId, StatusEnum.DELETED);
        for (CandidateExperience item : existing) {
            item.setStatus(StatusEnum.DELETED);
            repository.save(item);
        }

        if (experiences == null || experiences.isEmpty()) {
            return;
        }

        for (CandidateExperienceDto dto : experiences) {
            if (dto == null) {
                continue;
            }
            String company = trimRequired(dto.getCompanyName());
            String jobTitle = trimRequired(dto.getJobTitle());
            if (company.isEmpty() || jobTitle.isEmpty() || dto.getStartDate() == null) {
                continue;
            }
            boolean currentJob = Boolean.TRUE.equals(dto.getCurrentJob());
            CandidateExperience entity = CandidateExperience.builder()
                    .status(StatusEnum.ACTIVE)
                    .candidateId(candidateId)
                    .companyName(company)
                    .jobTitle(jobTitle)
                    .startDate(dto.getStartDate())
                    .endDate(currentJob ? null : dto.getEndDate())
                    .currentJob(currentJob)
                    .description(trimToNull(dto.getDescription()))
                    .build();
            repository.save(entity);
        }
    }

    private CandidateExperienceDto toDto(CandidateExperience entity) {
        return CandidateExperienceDto.builder()
                .id(entity.getId())
                .companyName(entity.getCompanyName())
                .jobTitle(entity.getJobTitle())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .currentJob(Boolean.TRUE.equals(entity.getCurrentJob()))
                .description(entity.getDescription())
                .build();
    }

    private static String trimRequired(String value) {
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
