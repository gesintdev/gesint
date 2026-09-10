package br.com.gommo.modules.dp.occupationalexam.clinic.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class MedicalClinicResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String corporateName;
    private final String cnpj;
    private final String address;
    private final String phone;
    private final String email;
    private final String examsOffered;
    private final LocalDate accreditationValidUntil;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
