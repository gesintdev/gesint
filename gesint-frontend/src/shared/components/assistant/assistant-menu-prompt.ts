import {getBreadcrumbs} from "@/config/breadcrumbs";
import type {AppRoute} from "@/config/routes";

export function buildAssistantMenuPrompt(route: AppRoute): string {
    const href = route.href?.split("?")[0] ?? "";
    const trail = href
        ? getBreadcrumbs(href)
              .map((item) => item.label.trim())
              .filter((label) => label.length > 0)
        : [route.label];
    const path = trail.length > 0 ? trail.join(" > ") : route.label;
    return `Quero entender o menu "${route.label}" (${path}). Explique para que ele serve, o que posso fazer nele e quando devo usá-lo.`;
}
