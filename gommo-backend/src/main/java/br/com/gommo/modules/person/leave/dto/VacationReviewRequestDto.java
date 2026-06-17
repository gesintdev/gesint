package br.com.gommo.modules.person.leave.dto;

import br.com.gommo.modules.person.leave.entity.VacationReviewActionEnum;
import jakarta.validation.constraints.NotNull;
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
public class VacationReviewRequestDto {
    @NotNull private VacationReviewActionEnum action;
    private String reason;
}
