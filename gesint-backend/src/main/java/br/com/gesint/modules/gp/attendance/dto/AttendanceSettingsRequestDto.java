package br.com.gesint.modules.gp.attendance.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Preferencias da Gestao de Ponto. Campos nulos mantem o valor atual (o app Gesint Tick ainda
 * manda so foto e localizacao).
 */
@Getter
@Setter
public class AttendanceSettingsRequestDto {
    private Boolean requirePhoto;
    private Boolean requireLocation;

    @Min(0)
    @Max(60)
    private Integer toleranceMinutes;

    private Boolean hourBankEnabled;
    private Boolean overtimeEnabled;
    private LocalDate hourBankStartDate;
    private Boolean notifyCollaborator;
    private Boolean notifyHr;
    private Boolean notifyNearLimits;
    private Boolean emailCollaborator;
    private Boolean emailHrDigest;

    @Size(max = 1000)
    private String hrDigestRecipients;
}
