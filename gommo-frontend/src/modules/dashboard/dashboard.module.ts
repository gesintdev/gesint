import { dashboardRoutes } from "@/modules/dashboard/config/dashboard.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const dashboardModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.DASHBOARD),
    routes: dashboardRoutes,
};
