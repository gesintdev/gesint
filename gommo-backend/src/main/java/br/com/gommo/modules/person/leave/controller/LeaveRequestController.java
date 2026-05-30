package br.com.gommo.modules.person.leave.controller;
import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.service.ILeaveRequestService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController @RequestMapping("/api/v1/leave-requests")
public class LeaveRequestController extends BaseController<LeaveRequestRequestDto, LeaveRequestResponseDto> {
    public LeaveRequestController(ILeaveRequestService service) { super(service); }
}
