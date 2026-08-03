import type {
    OccupationalPhysician,
    OccupationalPhysicianCreateDto,
} from "@/modules/rh/person/occupational-exam/physician/dto/occupational-physician.dto";
import { BaseService } from "@/modules/root/services/base.service";

class OccupationalPhysicianService extends BaseService<
    OccupationalPhysician,
    OccupationalPhysicianCreateDto,
    OccupationalPhysicianCreateDto
> {
    constructor() {
        super("/api/v1/occupational-physicians");
    }
}

export const occupationalPhysicianService = new OccupationalPhysicianService();
