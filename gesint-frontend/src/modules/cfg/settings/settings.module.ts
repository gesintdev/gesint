import {
    settingsAccessRoutes,
    settingsAttendanceLegacyRoute,
    settingsDpRoutes,
    settingsNotificationsLegacyRoute,
    settingsRhRoutes,
    settingsRoutes,
} from "@/modules/cfg/settings/config/settings.routes";
import {accountSettingsRoute} from "@/modules/cfg/account/config/account.routes";
import {ModuleEnum, ModuleEnumHelper, type TModule} from "@/modules/root/enum/ModuleEnum";

export const settingsAccessModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS_ACCESS),
    routes: settingsAccessRoutes,
};

export const settingsDpModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS_DP),
    routes: settingsDpRoutes,
};

export const settingsRhModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS_RH),
    routes: settingsRhRoutes,
};

/** Seções do menu CFG (rail de configurações). */
export const settingsModules: TModule[] = [settingsAccessModule, settingsDpModule, settingsRhModule];

/**
 * Módulo agregado (workspace / APP_ROUTES).
 * Inclui aliases legados de ponto/notificações para abas já abertas.
 * Conta pessoal fica fora do menu CFG (só pelo dropdown do header).
 */
export const settingsModule: TModule = {
    infos: ModuleEnumHelper.getById(ModuleEnum.SETTINGS),
    routes: [
        ...settingsRoutes,
        accountSettingsRoute,
        settingsAttendanceLegacyRoute,
        settingsNotificationsLegacyRoute,
    ],
};

export {settingsRoutes};
