import { paymentRoutes } from "@/modules/dp/payment/config/payment.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

export const paymentsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.PAYMENTS),
    routes: paymentRoutes,
};
