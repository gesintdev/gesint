package br.com.gesint.modules.rh.person.attendance.publicapi.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PublicPontoClockResponseDto {

    private final String collaboratorName;
    private final LocalDate workDate;
    private final LocalTime clockIn;
    private final LocalTime clockOut;
    private final LocalTime breakStart;
    private final LocalTime breakEnd;
    private final boolean pendingOutsideScheduleApproval;
    private final OffsetDateTime registeredAt;
    private final String message;
}
