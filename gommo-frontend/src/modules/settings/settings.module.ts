import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { settingsRoutes } from "@/modules/settings/config/settings.routes";

export const settingsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS),
    routes: settingsRoutes,
};
