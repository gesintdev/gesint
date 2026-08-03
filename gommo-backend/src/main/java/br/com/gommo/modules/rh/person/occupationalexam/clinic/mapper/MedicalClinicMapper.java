package br.com.gommo.modules.rh.person.occupationalexam.clinic.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.clinic.dto.MedicalClinicRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.clinic.dto.MedicalClinicResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.clinic.entity.MedicalClinic;

@Component
public class MedicalClinicMapper {

    public MedicalClinic toEntity(MedicalClinicRequestDto dto) {
        return MedicalClinic.builder()
                .status(StatusEnum.ACTIVE)
                .corporateName(trim(dto.getCorporateName()))
                .cnpj(trim(dto.getCnpj()))
                .address(blankToNull(dto.getAddress()))
                .phone(blankToNull(dto.getPhone()))
                .email(blankToNull(dto.getEmail()))
                .examsOffered(blankToNull(dto.getExamsOffered()))
                .accreditationValidUntil(dto.getAccreditationValidUntil())
                .build();
    }

    public void updateEntity(MedicalClinic entity, MedicalClinicRequestDto dto) {
        entity.setCorporateName(trim(dto.getCorporateName()));
        entity.setCnpj(trim(dto.getCnpj()));
        entity.setAddress(blankToNull(dto.getAddress()));
        entity.setPhone(blankToNull(dto.getPhone()));
        entity.setEmail(blankToNull(dto.getEmail()));
        entity.setExamsOffered(blankToNull(dto.getExamsOffered()));
        entity.setAccreditationValidUntil(dto.getAccreditationValidUntil());
    }

    public MedicalClinicResponseDto toResponse(MedicalClinic entity) {
        return MedicalClinicResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .corporateName(entity.getCorporateName())
                .cnpj(entity.getCnpj())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .examsOffered(entity.getExamsOffered())
                .accreditationValidUntil(entity.getAccreditationValidUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
