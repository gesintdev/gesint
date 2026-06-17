package br.com.gommo.modules.rh.person.performance.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.performance.dto.PerformanceReviewRequestDto;
import br.com.gommo.modules.rh.person.performance.dto.PerformanceReviewResponseDto;
import br.com.gommo.modules.rh.person.performance.service.IPerformanceReviewService;

@RestController
@RequestMapping("/api/v1/performance-reviews")
public class PerformanceReviewController
        extends BaseController<PerformanceReviewRequestDto, PerformanceReviewResponseDto> {
    public PerformanceReviewController(IPerformanceReviewService service) {
        super(service);
    }
}
