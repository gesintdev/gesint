"use client";
import { create } from "zustand";

import type { SystemAlertRequest } from "@/shared/system-alert/system-alert.types";

type SystemAlertState = {
    current: SystemAlertRequest | null;
    queue: SystemAlertRequest[];
    enqueue: (request: Omit<SystemAlertRequest, "id">) => void;
    dismiss: (confirmed: boolean) => void;
};

let nextId = 0;
export const useSystemAlertStore = create<SystemAlertState>((set, get) => ({
    current: null,
    queue: [],
    enqueue: (request) => {
        const entry: SystemAlertRequest = { ...request, id: String(++nextId) };
        const { current, queue } = get();
        if (!current) {
            set({ current: entry });
            return;
        }
        set({ queue: [...queue, entry] });
    },
    dismiss: (confirmed) => {
        const { current, queue } = get();
        if (!current) return;
        current.resolve(confirmed);
        const [next, ...rest] = queue;
        set({ current: next ?? null, queue: rest });
    },
}));
