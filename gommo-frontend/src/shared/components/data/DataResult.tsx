import {use, type ReactElement} from "react";

/**
 * Client Component para streaming com `use()`.
 * Passe como filho um componente que lê o contexto ou use o wrapper específico do módulo.
 */
export function useAsyncData<T>(promise: Promise<T>): T {
    return use(promise);
}

/**
 * Wrapper genérico: o conteúdo é passado como elemento (não função).
 * Ex.: <AsyncResult promise={p}><PersonTable persons={...} /></AsyncResult> não funciona sem dados.
 * Prefira `PersonAsyncSection` por módulo ou `DataRequest` no servidor.
 */
export function AsyncResult<T>({
                                   promise,
                                   content,
                               }: {
    promise: Promise<T>;
    content: (data: T) => ReactElement;
}) {
    const data = use(promise);
    return content(data);
}
