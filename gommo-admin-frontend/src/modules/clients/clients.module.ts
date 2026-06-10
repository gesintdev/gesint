import { clientsRoutes } from "@/modules/clients/config/clients.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const clientsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.CLIENTS),
    routes: clientsRoutes,
};
