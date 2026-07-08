package br.com.gommo.modules.rh.person.attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceSettingsRequestDto {
    private boolean requirePhoto;
    private boolean requireLocation;
}
