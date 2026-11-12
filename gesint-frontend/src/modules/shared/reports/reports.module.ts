import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { dpReportRoutes, rhReportRoutes } from "@/modules/shared/reports/config/reports.routes";

export const dpReportsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.REPORTS_DP),
    routes: dpReportRoutes,
};

export const rhReportsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.REPORTS_RH),
    routes: rhReportRoutes,
};
