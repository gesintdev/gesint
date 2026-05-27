import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { dashboardRoutes } from "@/modules/dashboard/config/dashboard.routes";

export const dashboardModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.DASHBOARD),
    routes: dashboardRoutes,
};
