package br.com.gommo.modules.dp.organization.company.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.dp.organization.company.dto.CompanyRequestDto;
import br.com.gommo.modules.dp.organization.company.dto.CompanyResponseDto;
import br.com.gommo.modules.dp.organization.company.entity.Company;

@Component
public class CompanyMapper {

    public Company toEntity(CompanyRequestDto dto) {
        return Company.builder()
                .legalName(dto.getLegalName())
                .tradeName(dto.getTradeName())
                .cnpj(dto.getCnpj())
                .stateRegistration(dto.getStateRegistration())
                .municipalRegistration(dto.getMunicipalRegistration())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .street(dto.getStreet())
                .number(dto.getNumber())
                .complement(dto.getComplement())
                .district(dto.getDistrict())
                .city(dto.getCity())
                .stateCode(dto.getStateCode())
                .zipCode(dto.getZipCode())
                .taxRegime(dto.getTaxRegime())
                .accountantName(dto.getAccountantName())
                .accountantEmail(dto.getAccountantEmail())
                .build();
    }

    public void updateEntity(Company entity, CompanyRequestDto dto) {
        entity.setLegalName(dto.getLegalName());
        entity.setTradeName(dto.getTradeName());
        entity.setCnpj(dto.getCnpj());
        entity.setStateRegistration(dto.getStateRegistration());
        entity.setMunicipalRegistration(dto.getMunicipalRegistration());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setStreet(dto.getStreet());
        entity.setNumber(dto.getNumber());
        entity.setComplement(dto.getComplement());
        entity.setDistrict(dto.getDistrict());
        entity.setCity(dto.getCity());
        entity.setStateCode(dto.getStateCode());
        entity.setZipCode(dto.getZipCode());
        entity.setTaxRegime(dto.getTaxRegime());
        entity.setAccountantName(dto.getAccountantName());
        entity.setAccountantEmail(dto.getAccountantEmail());
    }

    public CompanyResponseDto toResponse(Company entity) {
        return CompanyResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .legalName(entity.getLegalName())
                .tradeName(entity.getTradeName())
                .cnpj(entity.getCnpj())
                .stateRegistration(entity.getStateRegistration())
                .municipalRegistration(entity.getMunicipalRegistration())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .street(entity.getStreet())
                .number(entity.getNumber())
                .complement(entity.getComplement())
                .district(entity.getDistrict())
                .city(entity.getCity())
                .stateCode(entity.getStateCode())
                .zipCode(entity.getZipCode())
                .taxRegime(entity.getTaxRegime())
                .accountantName(entity.getAccountantName())
                .accountantEmail(entity.getAccountantEmail())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
