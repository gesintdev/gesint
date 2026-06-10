import type { ReactNode } from "react";

type DataRequestProps<T> = {
    request: () => Promise<T>;
    children: (data: T) => ReactNode;
};

export async function DataRequest<T>({ request, children }: DataRequestProps<T>) {
    const data = await request();

    return <>{children(data)}</>;
}
