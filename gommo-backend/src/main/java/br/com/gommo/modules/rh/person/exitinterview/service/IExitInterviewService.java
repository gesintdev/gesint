package br.com.gommo.modules.rh.person.exitinterview.service;

import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewCancelRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewResponseDto;

public interface IExitInterviewService extends IBaseService<ExitInterviewRequestDto, ExitInterviewResponseDto> {
    ExitInterviewResponseDto complete(UUID id);

    ExitInterviewResponseDto cancel(UUID id, ExitInterviewCancelRequestDto request);
}
