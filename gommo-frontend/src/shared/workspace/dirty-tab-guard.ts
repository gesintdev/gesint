import { SystemAlert } from "@/shared/system-alert";

type DirtyChecker = () => boolean;

const dirtyCheckers = new Map<string, DirtyChecker>();

/** Registra se a aba do workspace tem edições pendentes. Retorna disposer. */
export function registerTabDirtyGuard(tabId: string, isDirty: DirtyChecker): () => void {
    dirtyCheckers.set(tabId, isDirty);
    return () => {
        if (dirtyCheckers.get(tabId) === isDirty) {
            dirtyCheckers.delete(tabId);
        }
    };
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
