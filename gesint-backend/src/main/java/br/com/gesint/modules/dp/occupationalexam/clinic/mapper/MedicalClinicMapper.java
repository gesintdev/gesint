package br.com.gesint.modules.dp.occupationalexam.clinic.mapper;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.clinic.dto.MedicalClinicRequestDto;
import br.com.gesint.modules.dp.occupationalexam.clinic.dto.MedicalClinicResponseDto;
import br.com.gesint.modules.dp.occupationalexam.clinic.entity.MedicalClinic;
import br.com.gesint.modules.rh.person.collaborators.address.entity.City;
import br.com.gesint.modules.rh.person.collaborators.address.entity.State;
import br.com.gesint.modules.rh.person.collaborators.address.service.AddressReferenceResolver;
import br.com.gesint.modules.rh.person.collaborators.address.service.AddressReferenceResolver.AddressReference;

@Component
public class MedicalClinicMapper {

    private final AddressReferenceResolver addressReferenceResolver;

    public MedicalClinicMapper(AddressReferenceResolver addressReferenceResolver) {
        this.addressReferenceResolver = addressReferenceResolver;
    }

    public MedicalClinic toEntity(MedicalClinicRequestDto dto) {
        MedicalClinic entity = MedicalClinic.builder()
                .status(StatusEnum.ACTIVE)
                .corporateName(trim(dto.getCorporateName()))
                .cnpj(trim(dto.getCnpj()))
                .phone(blankToNull(dto.getPhone()))
                .email(blankToNull(dto.getEmail()))
                .examsOffered(blankToNull(dto.getExamsOffered()))
                .accreditationValidUntil(dto.getAccreditationValidUntil())
                .build();
        applyAddress(entity, dto);
        return entity;
    }

    public void updateEntity(MedicalClinic entity, MedicalClinicRequestDto dto) {
        entity.setCorporateName(trim(dto.getCorporateName()));
        entity.setCnpj(trim(dto.getCnpj()));
        entity.setPhone(blankToNull(dto.getPhone()));
        entity.setEmail(blankToNull(dto.getEmail()));
        entity.setExamsOffered(blankToNull(dto.getExamsOffered()));
        entity.setAccreditationValidUntil(dto.getAccreditationValidUntil());
        applyAddress(entity, dto);
    }

    public MedicalClinicResponseDto toResponse(MedicalClinic entity) {
        City city = entity.getCity();
        State state = entity.getState();
        return MedicalClinicResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .corporateName(entity.getCorporateName())
                .cnpj(entity.getCnpj())
                .address(entity.getAddress())
                .zipCode(entity.getZipCode())
                .street(entity.getStreet())
                .number(entity.getNumber())
                .complement(entity.getComplement())
                .district(entity.getDistrict())
                .stateId(state != null ? state.getId() : null)
                .stateCode(state != null ? state.getAbbreviation() : null)
                .stateName(state != null ? state.getName() : null)
                .cityId(city != null ? city.getId() : null)
                .cityName(city != null ? city.getName() : null)
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .examsOffered(entity.getExamsOffered())
                .accreditationValidUntil(entity.getAccreditationValidUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private void applyAddress(MedicalClinic entity, MedicalClinicRequestDto dto) {
        AddressReference reference = addressReferenceResolver.resolve(dto.getStateId(), dto.getCityId());
        entity.setState(reference.state());
        entity.setCity(reference.city());
        entity.setZipCode(blankToNull(dto.getZipCode()));
        entity.setStreet(blankToNull(dto.getStreet()));
        entity.setNumber(blankToNull(dto.getNumber()));
        entity.setComplement(blankToNull(dto.getComplement()));
        entity.setDistrict(blankToNull(dto.getDistrict()));
        entity.setAddress(composeAddress(entity, reference));
    }

    private static String composeAddress(MedicalClinic entity, AddressReference reference) {
        String city = reference.city() != null ? reference.city().getName() : null;
        String state = reference.state() != null ? reference.state().getAbbreviation() : null;
        String locality = join(" / ", city, state);
        return blankToNull(join(", ",
                join(" ", entity.getStreet(), entity.getNumber()),
                entity.getDistrict(),
                entity.getComplement(),
                locality,
                entity.getZipCode()));
    }

    private static String join(String separator, String... parts) {
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.isBlank()) continue;
            if (!builder.isEmpty()) builder.append(separator);
            builder.append(part.trim());
        }
        return builder.isEmpty() ? null : builder.toString();
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
