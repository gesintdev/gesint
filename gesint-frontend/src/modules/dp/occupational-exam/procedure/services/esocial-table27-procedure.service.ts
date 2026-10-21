import type { EsocialTable27Procedure } from "@/modules/dp/occupational-exam/procedure/dto/esocial-table27-procedure.dto";
import { BaseService } from "@/modules/root/services/base.service";

class EsocialTable27ProcedureService extends BaseService<
    EsocialTable27Procedure,
    EsocialTable27Procedure,
    EsocialTable27Procedure
> {
    constructor() {
        super("/api/v1/esocial-table27-procedures");
    }
}

export const esocialTable27ProcedureService = new EsocialTable27ProcedureService();
