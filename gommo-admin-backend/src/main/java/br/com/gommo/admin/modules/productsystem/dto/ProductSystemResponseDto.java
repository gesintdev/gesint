package br.com.gommo.admin.modules.productsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSystemResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private String key;
    private String name;
    private String description;
    private BigDecimal defaultPrice;
    private boolean withAiAvailable;
    private Integer sortOrder;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
