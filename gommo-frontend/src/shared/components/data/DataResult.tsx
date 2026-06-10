import { use, type ReactElement } from "react";
/**
 * Client Component para streaming com `use()`.
 * Passe como filho um componente que lê o contexto ou use o wrapper específico do módulo.
 */
export function useAsyncData<T>(promise: Promise<T>): T {
    return use(promise);
}

export function AsyncResult<T>({ promise, content }: { promise: Promise<T>; content: (data: T) => ReactElement }) {
    const data = use(promise);

    return content(data);
}
