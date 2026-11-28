package br.com.gesint.modules.gp.settings.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

/** Preferencias de ponto do cliente (uma por tenant, guardadas em system_setting). */
@Getter
@Builder(toBuilder = true)
public class TimeTrackingSettings {
    private final boolean requirePhoto;
    private final boolean requireLocation;
    /** Variacao diaria tolerada (CLT art. 58 par. 1: ate 10 minutos por dia). */
    private final int toleranceMinutes;
    private final boolean hourBankEnabled;
    private final boolean overtimeEnabled;
    /** Inicio da apuracao do banco de horas; antes disso o saldo nao acumula. */
    private final LocalDate hourBankStartDate;
    private final boolean notifyCollaborator;
    private final boolean notifyHr;
    private final boolean notifyNearLimits;
    private final boolean emailCollaborator;
    private final boolean emailHrDigest;
    private final String hrDigestRecipients;
}
