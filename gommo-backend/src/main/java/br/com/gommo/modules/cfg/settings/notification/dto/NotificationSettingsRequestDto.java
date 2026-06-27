package br.com.gommo.modules.cfg.settings.notification.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationSettingsRequestDto {

    @NotNull @Min(1) @Max(365) private Integer vacationDueNoticeDays;
}
