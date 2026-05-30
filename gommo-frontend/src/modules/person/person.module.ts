import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";
import { personRoutes } from "@/modules/person/config/person.routes";

export const personModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.PERSON),
    routes: personRoutes,
};
