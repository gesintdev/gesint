package br.com.gesint.admin.modules.clientbranch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.admin.core.entity.StatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientBranchResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private UUID tenantCompanyId;
    private int sortOrder;
    private String legalName;
    private String tradeName;
    private String cnpj;
    private String stateRegistration;
    private String municipalRegistration;
    private String email;
    private String phone;
    private String street;
    private String number;
    private String complement;
    private String district;
    private String city;
    private String stateCode;
    private String zipCode;
    /** Preenchido quando a filial ja existe como company no schema do tenant. */
    private OffsetDateTime provisionedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
