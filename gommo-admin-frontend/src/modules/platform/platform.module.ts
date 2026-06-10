import { platformRoutes } from "@/modules/platform/config/platform.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const platformModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.PLATFORM),
    routes: platformRoutes,
};
