package br.com.gommo.modules.person.offboarding.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.person.offboarding.entity.DismissalTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingRequestDto {
    @NotNull private UUID collaboratorId;

    @NotNull private LocalDate dismissalDate;

    private DismissalTypeEnum dismissalType;
    private String dismissalNotes;
    private String homologationNotes;
}
