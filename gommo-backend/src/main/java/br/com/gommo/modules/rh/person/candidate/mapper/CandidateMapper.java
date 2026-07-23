package br.com.gommo.modules.rh.person.candidate.mapper;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateRequestDto;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateResponseDto;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;

@Component
public class CandidateMapper {
    public Candidate toEntity(CandidateRequestDto dto) {
        return Candidate.builder()
                .fullName(requireName(dto.getFullName()))
                .cpf(requireCpf(dto.getCpf()))
                .email(trimToNull(dto.getEmail()))
                .phone(trimToNull(dto.getPhone()))
                .birthDate(dto.getBirthDate())
                .city(trimToNull(dto.getCity()))
                .stateCode(normalizeState(dto.getStateCode()))
                .linkedinUrl(trimToNull(dto.getLinkedinUrl()))
                .portfolioUrl(trimToNull(dto.getPortfolioUrl()))
                .build();
    }

    public void updateEntity(Candidate entity, CandidateRequestDto dto) {
        entity.setFullName(requireName(dto.getFullName()));
        entity.setCpf(requireCpf(dto.getCpf()));
        entity.setEmail(trimToNull(dto.getEmail()));
        entity.setPhone(trimToNull(dto.getPhone()));
        entity.setBirthDate(dto.getBirthDate());
        entity.setCity(trimToNull(dto.getCity()));
        entity.setStateCode(normalizeState(dto.getStateCode()));
        entity.setLinkedinUrl(trimToNull(dto.getLinkedinUrl()));
        entity.setPortfolioUrl(trimToNull(dto.getPortfolioUrl()));
    }

    public CandidateResponseDto toResponse(Candidate entity) {
        return toResponse(entity, Collections.emptyList());
    }

    public CandidateResponseDto toResponse(Candidate entity, List<CandidateExperienceDto> experiences) {
        return CandidateResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .fullName(entity.getFullName())
                .cpf(entity.getCpf())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .birthDate(entity.getBirthDate())
                .city(entity.getCity())
                .stateCode(entity.getStateCode())
                .linkedinUrl(entity.getLinkedinUrl())
                .portfolioUrl(entity.getPortfolioUrl())
                .experiences(experiences == null ? Collections.emptyList() : experiences)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String requireName(String value) {
        return value == null ? "" : value.trim();
    }

    private static String requireCpf(String value) {
        return value == null ? "" : value.trim();
    }

    private static String normalizeState(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
