package br.com.gommo.admin.modules.productsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSystemRequestDto {

    @NotBlank @Size(max = 32) private String key;

    @NotBlank @Size(max = 150) private String name;

    private String description;

    private BigDecimal defaultPrice;

    private Boolean withAiAvailable;

    private Integer sortOrder;

    private String notes;
}
