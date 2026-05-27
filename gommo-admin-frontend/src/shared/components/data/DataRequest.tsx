import type {ReactNode} from "react";

type DataRequestProps<T> = {
    request: () => Promise<T>;
    children: (data: T) => ReactNode;
};

/**
 * Server Component: aguarda a requisição e renderiza no servidor.
 * Não passe funções para Client Components — use este padrão apenas em RSC.
 */
export async function DataRequest<T>({request, children}: DataRequestProps<T>) {
    const data = await request();
    return <>{children(data)}</>;
}
