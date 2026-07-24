"use client";

import { create } from "zustand";

export type AccessTokenRevealContext = "create" | "reset";

export type AccessTokenRevealRequest = {
    id: string;
    token: string;
    context: AccessTokenRevealContext;
    resolve: () => void;
};

type AccessTokenRevealState = {
    current: AccessTokenRevealRequest | null;
    queue: AccessTokenRevealRequest[];
    enqueue: (request: Omit<AccessTokenRevealRequest, "id">) => void;
    dismiss: () => void;
};

let nextId = 0;

export const useAccessTokenRevealStore = create<AccessTokenRevealState>((set, get) => ({
    current: null,
    queue: [],
    enqueue: (request) => {
        const entry: AccessTokenRevealRequest = { ...request, id: String(++nextId) };
        const { current, queue } = get();
        if (!current) {
            set({ current: entry });
            return;
        }
        set({ queue: [...queue, entry] });
    },
    dismiss: () => {
        const { current, queue } = get();
        if (!current) return;
        current.resolve();
        const [next, ...rest] = queue;
        set({ current: next ?? null, queue: rest });
    },
}));

export function showAccessTokenReveal(token: string, context: AccessTokenRevealContext): Promise<void> {
    return new Promise((resolve) => {
        useAccessTokenRevealStore.getState().enqueue({
            token,
            context,
            resolve,
        });
    });
}
