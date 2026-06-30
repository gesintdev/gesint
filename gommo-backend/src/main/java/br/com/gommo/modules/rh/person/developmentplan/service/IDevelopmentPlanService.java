package br.com.gommo.modules.rh.person.developmentplan.service;

import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.developmentplan.dto.*;

public interface IDevelopmentPlanService extends IBaseService<DevelopmentPlanRequestDto, DevelopmentPlanResponseDto> {
    DevelopmentPlanResponseDto submitForApproval(UUID id);

    DevelopmentPlanResponseDto approve(UUID id, DevelopmentPlanApprovalRequestDto request);

    DevelopmentPlanResponseDto conclude(UUID id);

    DevelopmentPlanResponseDto cancel(UUID id, DevelopmentPlanCancelRequestDto request);
}