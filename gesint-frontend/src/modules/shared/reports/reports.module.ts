import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { reportRoutes } from "@/modules/shared/reports/config/reports.routes";

export const reportsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.REPORTS),
    routes: reportRoutes,
};
