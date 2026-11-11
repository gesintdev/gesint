package br.com.gesint.modules.root.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gesint.modules.root.entity.PdfDeliveryModeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountPreferencesDto {

    @NotNull
    private PdfDeliveryModeEnum reportPdfDeliveryMode;
}
