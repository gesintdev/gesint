package br.com.gommo.modules.dp.offboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EsocialDismissalReasonDto {
    private String reasonCode;
    private String description;
    private String dismissalType;
    private String label;
}
