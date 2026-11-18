import type { Profile } from "@/modules/cfg/settings/profile/dto/profile.dto";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { canAccessRoute } from "@/shared/auth/route-access";

/** Administrador do sistema não materializa permissões; o token leva ADM:{sistema}. */
export function profileAuthorities(profile: Profile): string[] {
    const granted = (profile.permissions ?? []).map((permission) => permission.authority);
    if (profile.roleType === "ADMIN") {
        granted.push(`ADM:${profile.system}`);
    }
    return granted;
}

function routeIsPermissionGated(route: AppRoute): boolean {
    return !route.publicAccess && Boolean(route.permission || route.permissionsAny?.length);
}

/** O menu (ou algum item dentro do grupo) depende de permissão de perfil. */
export function menuDependsOnProfile(route: AppRoute): boolean {
    if (routeIsPermissionGated(route)) return true;
    return (route.children ?? []).some(menuDependsOnProfile);
}

/** Perfil enxerga este item, ou algum filho quando o clique foi num grupo. */
export function profileGrantsMenu(profile: Profile, route: AppRoute): boolean {
    const authorities = profileAuthorities(profile);
    if (routeIsPermissionGated(route) && canAccessRoute(route, authorities)) {
        return true;
    }
    return (route.children ?? []).some((child) => profileGrantsMenu(profile, child));
}
