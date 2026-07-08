package br.com.gommo.modules.rh.person.attendance.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceSettingsResponseDto {
    private final boolean requirePhoto;
    private final boolean requireLocation;
}
