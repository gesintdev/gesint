import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { clientsRoutes } from "@/modules/clients/config/clients.routes";

export const clientsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.CLIENTS),
    routes: clientsRoutes,
};
