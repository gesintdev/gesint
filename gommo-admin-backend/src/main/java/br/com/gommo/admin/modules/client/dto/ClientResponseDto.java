package br.com.gommo.admin.modules.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;

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
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
