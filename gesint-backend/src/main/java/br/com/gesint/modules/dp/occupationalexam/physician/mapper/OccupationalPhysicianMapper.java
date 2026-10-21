package br.com.gesint.modules.dp.occupationalexam.physician.mapper;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.physician.dto.OccupationalPhysicianRequestDto;
import br.com.gesint.modules.dp.occupationalexam.physician.dto.OccupationalPhysicianResponseDto;
import br.com.gesint.modules.dp.occupationalexam.physician.entity.OccupationalPhysician;

@Component
public class OccupationalPhysicianMapper {

    public OccupationalPhysician toEntity(OccupationalPhysicianRequestDto dto) {
        return OccupationalPhysician.builder()
                .status(StatusEnum.ACTIVE)
                .fullName(trim(dto.getFullName()))
                .crm(trim(dto.getCrm()))
                .crmState(normalizeUf(dto.getCrmState()))
                .role(dto.getRole())
                .phone(blankToNull(dto.getPhone()))
                .email(blankToNull(dto.getEmail()))
                .build();
    }

    public void updateEntity(OccupationalPhysician entity, OccupationalPhysicianRequestDto dto) {
        entity.setFullName(trim(dto.getFullName()));
        entity.setCrm(trim(dto.getCrm()));
        entity.setCrmState(normalizeUf(dto.getCrmState()));
        entity.setRole(dto.getRole());
        entity.setPhone(blankToNull(dto.getPhone()));
        entity.setEmail(blankToNull(dto.getEmail()));
    }

    public OccupationalPhysicianResponseDto toResponse(OccupationalPhysician entity) {
        return toResponse(entity, Collections.emptyList());
    }

    public OccupationalPhysicianResponseDto toResponse(OccupationalPhysician entity, List<UUID> clinicIds) {
        return OccupationalPhysicianResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .fullName(entity.getFullName())
                .crm(entity.getCrm())
                .crmState(entity.getCrmState())
                .role(entity.getRole())
                .clinicIds(clinicIds == null ? List.of() : List.copyOf(clinicIds))
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
