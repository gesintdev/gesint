package br.com.gesint.modules.dp.occupationalexam.clinic.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;

@Getter
@Builder
public class MedicalClinicResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String corporateName;
    private final String cnpj;
    private final String address;
    private final String zipCode;
    private final String street;
    private final String number;
    private final String complement;
    private final String district;
    private final UUID stateId;
    private final String stateCode;
    private final String stateName;
    private final UUID cityId;
    private final String cityName;
    private final String phone;
    private final String email;
    private final String examsOffered;
    private final LocalDate accreditationValidUntil;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
