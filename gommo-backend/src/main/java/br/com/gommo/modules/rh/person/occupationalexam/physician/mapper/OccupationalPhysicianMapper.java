package br.com.gommo.modules.rh.person.occupationalexam.physician.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.entity.OccupationalPhysician;

@Component
public class OccupationalPhysicianMapper {

    public OccupationalPhysician toEntity(OccupationalPhysicianRequestDto dto) {
        return OccupationalPhysician.builder()
                .status(StatusEnum.ACTIVE)
                .fullName(trim(dto.getFullName()))
                .crm(trim(dto.getCrm()))
                .crmState(normalizeUf(dto.getCrmState()))
                .role(dto.getRole())
                .clinicId(dto.getClinicId())
                .phone(blankToNull(dto.getPhone()))
                .email(blankToNull(dto.getEmail()))
                .build();
    }

    public void updateEntity(OccupationalPhysician entity, OccupationalPhysicianRequestDto dto) {
        entity.setFullName(trim(dto.getFullName()));
        entity.setCrm(trim(dto.getCrm()));
        entity.setCrmState(normalizeUf(dto.getCrmState()));
        entity.setRole(dto.getRole());
        entity.setClinicId(dto.getClinicId());
        entity.setPhone(blankToNull(dto.getPhone()));
        entity.setEmail(blankToNull(dto.getEmail()));
    }

    public OccupationalPhysicianResponseDto toResponse(OccupationalPhysician entity) {
        return OccupationalPhysicianResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .fullName(entity.getFullName())
                .crm(entity.getCrm())
                .crmState(entity.getCrmState())
                .role(entity.getRole())
                .clinicId(entity.getClinicId())
                .phone(entity.getPhone())
                .email(entity.getEmail())
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

    private static String normalizeUf(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }
}
