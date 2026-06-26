"use client";
import { type ReactElement,use } from "react";

export function useAsyncData<T>(promise: Promise<T>): T {
    return use(promise);
}

export function AsyncResult<T>({ promise, content }: { promise: Promise<T>; content: (data: T) => ReactElement }) {
    const data = use(promise);

    return content(data);
}
