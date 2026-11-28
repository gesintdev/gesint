/**
 * "Ir para Menu" (ações da aba): pede à sidebar que mostre o item de menu de uma rota — abre os
 * grupos até ele, rola até a vista e dá um destaque rápido. A sidebar escuta o evento.
 */
export const SIDEBAR_REVEAL_ROUTE_EVENT = "gesint:sidebar-reveal-route";

export type SidebarRevealRouteDetail = {
    routeId: string;
};

export function requestSidebarReveal(routeId: string) {
    window.dispatchEvent(
        new CustomEvent<SidebarRevealRouteDetail>(SIDEBAR_REVEAL_ROUTE_EVENT, {detail: {routeId}}),
    );
}
