package br.com.gesint.modules.gp.hourbank.service;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gesint.modules.gp.hourbank.dto.HourBankResponseDto;

public interface IHourBankService {
    HourBankResponseDto balances(LocalDate from, LocalDate to);

    HourBankResponseDto.Statement statement(UUID collaboratorId, LocalDate from, LocalDate to);
}
