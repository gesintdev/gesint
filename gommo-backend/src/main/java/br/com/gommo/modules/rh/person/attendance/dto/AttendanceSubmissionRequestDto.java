package br.com.gommo.modules.rh.person.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSubmissionRequestDto {
    @NotNull private AttendanceRequestTypeEnum requestType;

    @NotNull private LocalDate requestDate;

    private LocalTime clockIn;
    private LocalTime clockOut;
    private Integer breakMinutes;
    private BigDecimal expectedHours;
    private BigDecimal workedHours;

    @NotBlank @Size(max = 4000) private String details;

    @Valid private AttendanceAttachmentReferenceDto attachment;

    private AttendanceSourceEnum source;

    @NotBlank @Size(max = 80) private String clientRequestId;

    @NotNull private OffsetDateTime submittedAt;
}
