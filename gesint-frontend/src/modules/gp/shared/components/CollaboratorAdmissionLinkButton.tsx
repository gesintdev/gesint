"use client";

import {MoveUpRight} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";

import {admissionprocessService} from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import {SystemEnum, SystemEnumHelper} from "@/modules/root/enum/SystemEnum";
import {Button} from "@/shared/components/ui/Button";
import {ExceptionCapture} from "@/shared/exceptions";
import {confirmDiscardUnsavedChanges} from "@/shared/workspace/dirty-tab-guard";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";
import {workspaceUrlWithCrud} from "@/shared/workspace/workspace-navigation-url";
import {defaultShortLabel, findRouteById} from "@/shared/workspace/workspace-routes";
import {buildWorkspaceTabId} from "@/shared/workspace/workspace-tab-id";

/** Admissão é rota compartilhada de DP e RH (mesmo href); o sistema do rail decide o menu. */
const ADMISSION_ROUTE_ID = "collaborator-admission";

type CollaboratorAdmissionLinkButtonProps = {
    collaboratorId: string;
    collaboratorName?: string | null;
    /** DP ou RH: sistema em que a admissão abre (ver `useAdmissionLinkColumn`). */
    targetSystem: SystemEnum.DP | SystemEnum.RH;
};

/** Leva o colaborador da grid do GP para a admissão dele (DP ou RH), sem trocar o rail. */
export function CollaboratorAdmissionLinkButton({
                                                    collaboratorId,
                                                    collaboratorName,
                                                    targetSystem,
                                                }: CollaboratorAdmissionLinkButtonProps) {
    const [loading, setLoading] = useState(false);
    const systemAcronym = SystemEnumHelper.getById(targetSystem).acronym;
    const label = collaboratorName
        ? `Abrir admissão de ${collaboratorName} no ${systemAcronym}`
        : `Abrir admissão no ${systemAcronym}`;

    const openAdmission = async () => {
        const route = findRouteById(ADMISSION_ROUTE_ID);
        if (!route?.href) return;
        setLoading(true);
        try {
            const admission = await admissionprocessService.findCurrentByCollaborator(collaboratorId);
            if (!admission) {
                toast.info("Este colaborador não tem admissão registrada.");
                return;
            }
            // Uma aba só de Admissão: trocar de pessoa substitui a admissão aberta, como na listagem dela.
            const listTabId = buildWorkspaceTabId(route.id, "list");
            if (!(await confirmDiscardUnsavedChanges(listTabId))) return;
            // Só abre a aba: o rail e o menu lateral ficam como estão. A aba entra no grupo do sistema
            // de destino (DP ou RH), já que Admissão existe nos dois.
            // 1) A URL com `?edit=` primeiro: aba que já existe troca o registro (mesmo caminho do
            //    voltar/avançar) e aba nova já nasce em Editar (lê a URL na montagem), sem Listagem antes.
            window.history.pushState(null, "", workspaceUrlWithCrud(route.href, {editingId: admission.id}));
            // 2) Sem a aba da listagem, cria (o `?edit=` sozinho abriria uma aba por registro). Se já
            //    existe, não foca aqui: o workspace foca no mesmo passo em que aplica o `?edit=`.
            const store = useWorkspaceStore.getState();
            if (!store.tabs.some((tab) => tab.id === listTabId)) {
                store.openModuleTab({
                    routeId: route.id,
                    href: route.href,
                    routeLabel: route.label,
                    shortLabel: route.tabShortLabel ?? defaultShortLabel(route.label),
                    icon: route.icon,
                    system: targetSystem,
                });
            }
        } catch (error) {
            ExceptionCapture.handle(error, {fallbackMessage: "Não foi possível abrir a admissão."});
        } finally {
            setLoading(false);
        }
    };

    return (
        // Chip com a sigla do destino: diz para onde leva antes do clique.
        <Button
            variant="ghost"
            size="sm"
            className="gesint-table-link-chip"
            aria-label={label}
            title={label}
            loading={loading}
            rightIcon={<MoveUpRight className="gesint-table-link-chip__icon" strokeWidth={2.25} aria-hidden/>}
            onClick={(event) => {
                event.stopPropagation();
                void openAdmission();
            }}
        >
            {systemAcronym}
        </Button>
    );
}
