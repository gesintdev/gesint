package br.com.gesint.modules.rh.person.performance.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.performance.dto.PerformanceReviewRequestDto;
import br.com.gesint.modules.rh.person.performance.dto.PerformanceReviewResponseDto;

public interface IPerformanceReviewService
        extends IBaseService<PerformanceReviewRequestDto, PerformanceReviewResponseDto> {}
