import { timeManagementRoutes } from "@/modules/gp/attendance/config/attendance.routes";
import { timeReportRoutes } from "@/modules/gp/report/config/time-report.routes";
import { timeSettingsRoutes } from "@/modules/gp/settings/config/time-settings.routes";
import { ModuleEnum, ModuleEnumHelper, type TModule } from "@/modules/root/enum/ModuleEnum";

/** Seções do menu do sistema Gestão de Ponto (GP). */
export const timeManagementModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.TIME_MANAGEMENT),
    routes: timeManagementRoutes,
};

export const timeReportsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.REPORTS_GP),
    routes: timeReportRoutes,
};

export const timeSettingsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS_GP),
    routes: timeSettingsRoutes,
};
