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
import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceClockRequestDto {
    @NotNull private OffsetDateTime capturedAt;
    @Valid private AttendanceAttachmentReferenceDto photo;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal locationAccuracyMeters;
    @NotBlank @Size(max = 80) private String clientRequestId;
}
