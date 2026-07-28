import { SystemAlert } from "@/shared/system-alert";

type DirtyChecker = () => boolean;
type TabCloseHandler = () => void;

const dirtyCheckers = new Map<string, DirtyChecker>();
const closeHandlers = new Map<string, Set<TabCloseHandler>>();

/** Registra se a aba do workspace tem edições pendentes. Retorna disposer. */
export function registerTabDirtyGuard(tabId: string, isDirty: DirtyChecker): () => void {
    dirtyCheckers.set(tabId, isDirty);
    return () => {
        if (dirtyCheckers.get(tabId) === isDirty) {
            dirtyCheckers.delete(tabId);
        }
    };
}

/** Registra cleanup ao fechar a aba (ação explícita). Retorna disposer. */
export function registerTabCloseHandler(tabId: string, onClose: TabCloseHandler): () => void {
    let handlers = closeHandlers.get(tabId);
    if (!handlers) {
        handlers = new Set();
        closeHandlers.set(tabId, handlers);
    }
    handlers.add(onClose);
    return () => {
        const current = closeHandlers.get(tabId);
        if (!current) return;
        current.delete(onClose);
        if (current.size === 0) {
            closeHandlers.delete(tabId);
        }
    };
}

/** Dispara handlers registrados para fechamento intencional da aba. */
export function notifyTabClosed(tabId: string): void {
    const handlers = closeHandlers.get(tabId);
    if (!handlers?.size) return;
    for (const handler of [...handlers]) {
        try {
            handler();
        } catch {
            // Cleanup não pode bloquear o fechamento da aba.
        }
    }
}

export function isTabDirty(tabId: string): boolean {
    return Boolean(dirtyCheckers.get(tabId)?.());
}

/** Confirma fechamento quando há alterações não salvas. */
export async function confirmCloseDirtyTab(tabId: string): Promise<boolean> {
    if (!isTabDirty(tabId)) return true;
    return SystemAlert.confirm({
        title: "Alterações não salvas",
        message: "Há edições em andamento que serão perdidas. Deseja sair mesmo assim?",
        confirmLabel: "Sair sem salvar",
        cancelLabel: "Continuar editando",
        variant: "warning",
    });
}
