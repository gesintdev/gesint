import type { AttendanceRecord, AttendanceRecordCreateDto } from "@/modules/person/attendance/dto/attendance-record.dto";

export function attendancerecordToFormDto(entity: AttendanceRecord): AttendanceRecordCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        workDate: entity.workDate?.slice(0, 10) ?? "",
        clockIn: entity.clockIn ?? "",
        clockOut: entity.clockOut ?? "",
    };
}

export const emptyAttendanceRecordForm = (): AttendanceRecordCreateDto => ({
    collaboratorId: "",
    workDate: "",
    clockIn: "",
    clockOut: "",
});
