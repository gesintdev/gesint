import { insightsRoutes } from "@/modules/insights/config/insights.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const insightsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.INSIGHTS),
    routes: insightsRoutes,
};
