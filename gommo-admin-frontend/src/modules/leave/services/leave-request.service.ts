import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/leave/dto/leave-request.dto";
import { BaseService } from "@/modules/root/services/base.service";
class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestCreateDto, LeaveRequestCreateDto> {
    constructor() {
        super("/api/v1/leave-requests");
    }
}

export const leaverequestService = new LeaveRequestService();
