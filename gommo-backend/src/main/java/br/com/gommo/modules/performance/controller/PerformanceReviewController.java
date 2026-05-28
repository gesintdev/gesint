package br.com.gommo.modules.performance.controller;
import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.performance.dto.PerformanceReviewRequestDto;
import br.com.gommo.modules.performance.dto.PerformanceReviewResponseDto;
import br.com.gommo.modules.performance.service.IPerformanceReviewService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController @RequestMapping("/api/v1/performance-reviews")
public class PerformanceReviewController extends BaseController<PerformanceReviewRequestDto, PerformanceReviewResponseDto> {
    public PerformanceReviewController(IPerformanceReviewService service) { super(service); }
}
