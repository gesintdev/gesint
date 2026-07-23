package br.com.gommo.modules.rh.person.candidate.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder(toBuilder = true)
public class CandidateResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String fullName;
    private final String cpf;
    private final String email;
    private final String phone;
    private final LocalDate birthDate;
    private final String city;
    private final String stateCode;
    private final String linkedinUrl;
    private final String portfolioUrl;
    private final List<CandidateExperienceDto> experiences;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
