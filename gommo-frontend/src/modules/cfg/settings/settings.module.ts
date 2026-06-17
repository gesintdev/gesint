import { settingsRoutes } from "@/modules/cfg/settings/config/settings.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const settingsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS),
    routes: settingsRoutes,
};
