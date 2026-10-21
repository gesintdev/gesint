import type {
    MedicalClinic,
    MedicalClinicCreateDto,
} from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import { BaseService } from "@/modules/root/services/base.service";

class MedicalClinicService extends BaseService<MedicalClinic, MedicalClinicCreateDto, MedicalClinicCreateDto> {
    constructor() {
        super("/api/v1/medical-clinics");
    }
}

export const medicalClinicService = new MedicalClinicService();
