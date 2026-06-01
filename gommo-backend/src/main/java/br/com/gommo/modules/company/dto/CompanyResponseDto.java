package br.com.gommo.modules.company.dto;

import br.com.gommo.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String legalName;
    private final String tradeName;
    private final String cnpj;
    private final String stateRegistration;
    private final String municipalRegistration;
    private final String email;
    private final String phone;
    private final String street;
    private final String number;
    private final String complement;
    private final String district;
    private final String city;
    private final String stateCode;
    private final String zipCode;
    private final String taxRegime;
    private final String accountantName;
    private final String accountantEmail;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
