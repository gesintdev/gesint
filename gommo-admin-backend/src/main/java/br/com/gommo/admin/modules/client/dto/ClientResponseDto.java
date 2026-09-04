package br.com.gommo.admin.modules.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientcontact.dto.ClientContactDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private String name;
    private String legalName;
    private String slug;
    private String mobileLoginCode;
    private String document;
    private String street;
    private String number;
    private String complement;
    private String district;
    private String city;
    private String stateCode;
    private String zipCode;
    @Builder.Default private List<ClientContactDto> contacts = new ArrayList<>();
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
