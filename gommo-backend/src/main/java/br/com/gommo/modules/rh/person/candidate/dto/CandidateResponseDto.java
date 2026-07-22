package br.com.gommo.modules.rh.person.candidate.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class CandidateResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String fullName;
    private final String cpf;
    private final String email;
    private final String phone;
    private final LocalDate birthDate;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
