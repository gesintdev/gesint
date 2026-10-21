import { organizationRoutes } from "@/modules/dp/organization/config/organization.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const organizationModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.ORGANIZATION),
    routes: organizationRoutes,
};
