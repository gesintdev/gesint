"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {DOCUMENT_TYPE_TABLE_COLUMNS} from "@/modules/cfg/settings/documenttype/config/document-type.table-columns";
import type {DocumentType} from "@/modules/cfg/settings/documenttype/dto/document-type.dto";
import {documentTypeKeys} from "@/modules/cfg/settings/documenttype/documenttype.query";
import {documentTypeService} from "@/modules/cfg/settings/documenttype/services/document-type.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {useCrudStatusActions} from "@/shared/components/crud/useCrudStatusActions";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {
    CATALOG_STATUS_INITIAL_FILTERS,
    loadActiveAndInactiveRows,
    paginateCatalogRows,
} from "@/shared/lib/table/paginate-catalog-rows";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

export function DocumentTypeListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const {activateMutation, deactivateMutation, handleActivate, handleDeactivate} = useCrudStatusActions({
        service: documentTypeService,
        queryKey: documentTypeKeys.all,
        entityLabel: "Tipo de documento",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => documentTypeService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: documentTypeKeys.all});
            toast.success("Tipo de documento excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível excluir o tipo de documento."}),
    });
    const handleDelete = async (row: DocumentType) => {
        if (row.systemManaged) {
            toast.error("Tipos do sistema não podem ser excluídos. Desative-os se necessário.");
            return;
        }
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<DocumentType>
            queryKey={documentTypeKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => documentTypeService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={DOCUMENT_TYPE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum tipo de documento cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    onActivate={() => handleActivate(row.id)}
                    onDeactivate={() => void handleDeactivate(row.id)}
                    activateLoading={activateMutation.isPending && activateMutation.variables === row.id}
                    deactivateLoading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                />
            )}
        />
    );
}
