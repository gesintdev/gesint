import type {QueryClient} from "@tanstack/react-query";

import {notificationKeys} from "@/modules/cfg/settings/notification/notification.query";
import {attendancerecordKeys} from "@/modules/gp/attendance/attendance.query";
import {timeManagementKeys} from "@/modules/gp/shared/time-management.query";

/** Prefixo das consultas do ponto do próprio colaborador (relógio e semana no mobile). */
const OWN_ATTENDANCE_KEY = ["attendance"] as const;

/**
 * Tudo que lê marcação de ponto: Controle de ponto, histórico, solicitações, painel, banco de horas,
 * espelho, agenda, status, relógio do colaborador e o contador do sino. Toda mutação que altera ponto
 * (aprovar/recusar ajuste, lançar, editar, excluir) chama esta função para a tela não ficar desatualizada.
 */
export async function invalidateTimeQueries(queryClient: QueryClient) {
    await Promise.all([
        queryClient.invalidateQueries({queryKey: attendancerecordKeys.all}),
        queryClient.invalidateQueries({queryKey: timeManagementKeys.all}),
        queryClient.invalidateQueries({queryKey: OWN_ATTENDANCE_KEY}),
        queryClient.invalidateQueries({queryKey: notificationKeys.summary}),
    ]);
}
