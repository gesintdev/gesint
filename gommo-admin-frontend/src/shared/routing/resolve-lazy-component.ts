import type { ComponentType } from "react";

export type LazyComponent = () => Promise<ComponentType | { default: ComponentType }>;

export async function resolveLazyComponent(loader: LazyComponent): Promise<ComponentType> {
    const loaded = await loader();
    return (typeof loaded === "function" ? loaded : loaded.default) as ComponentType;
}

/** `import()` com export nomeado → lazy para workspace. */
export function lazyNamed<T extends ComponentType>(
    factory: () => Promise<Record<string, T>>,
    exportName: string,
): LazyComponent {
    return async () => {
        const loadedModule = await factory();
        const component = loadedModule[exportName];
        if (!component) {
            throw new Error(`Export "${exportName}" não encontrado no módulo lazy.`);
        }
        return component;
    };
}
