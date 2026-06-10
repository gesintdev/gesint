import { personRoutes } from "@/modules/person/config/person.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const personModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.PERSON),
    routes: personRoutes,
};
