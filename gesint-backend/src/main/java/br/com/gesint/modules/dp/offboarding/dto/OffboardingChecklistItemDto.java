package br.com.gesint.modules.dp.offboarding.dto;

import jakarta.validation.constraints.Size;
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
public class OffboardingChecklistItemDto {

    @Size(max = 80)
    private String key;

    @Size(max = 200)
    private String description;

    /** RETURN | ACCESS */
    @Size(max = 20)
    private String category;

    /** PENDING | RETURNED | NOT_APPLICABLE */
    @Size(max = 40)
    private String status;

    private String returnedAt;
    private String notes;
}
