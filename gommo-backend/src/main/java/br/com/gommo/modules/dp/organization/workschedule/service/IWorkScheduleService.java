package br.com.gommo.modules.dp.organization.workschedule.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleRequestDto;
import br.com.gommo.modules.dp.organization.workschedule.dto.WorkScheduleResponseDto;

public interface IWorkScheduleService extends IBaseService<WorkScheduleRequestDto, WorkScheduleResponseDto> {

    PageableResponseDto<WorkScheduleResponseDto> search(int page, int size, String name);

    List<WorkScheduleResponseDto> listActive();
}
