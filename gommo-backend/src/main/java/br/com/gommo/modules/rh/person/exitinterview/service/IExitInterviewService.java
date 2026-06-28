package br.com.gommo.modules.rh.person.exitinterview.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewCancelRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewInterviewerDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewResponseDto;

public interface IExitInterviewService extends IBaseService<ExitInterviewRequestDto, ExitInterviewResponseDto> {
    List<ExitInterviewInterviewerDto> listInterviewers();

    ExitInterviewResponseDto complete(UUID id);

    ExitInterviewResponseDto cancel(UUID id, ExitInterviewCancelRequestDto request);
}
