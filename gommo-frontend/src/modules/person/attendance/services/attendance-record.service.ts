import type {
    AttendanceRecord,
    AttendanceRecordCreateDto,
} from "@/modules/person/attendance/dto/attendance-record.dto";
import { BaseService } from "@/modules/root/services/base.service";
class AttendanceRecordService extends BaseService<
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRecordCreateDto
> {
    constructor() {
        super("/api/v1/attendance-records");
    }
}

export const attendancerecordService = new AttendanceRecordService();
