package br.com.gommo.modules.rh.person.leave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.rh.person.leave.entity.VacationReviewActionEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VacationReviewRequestDto {
    @NotNull private VacationReviewActionEnum action;

    private String reason;
}
