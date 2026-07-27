package br.com.gommo.modules.rh.person.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceReviewRequestDto {
    @NotBlank private String action;
    @Size(max = 4000) private String reason;
    /** HOUR_BANK | OVERTIME — obrigatorio ao aprovar OUTSIDE_SCHEDULE. */
    @Size(max = 40) private String compensationType;
}
