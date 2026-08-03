"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DIGITAL_CERTIFICATE_TABLE_COLUMNS } from "@/modules/cfg/settings/digital-certificate/config/digital-certificate.table-columns";
import { digitalCertificateKeys } from "@/modules/cfg/settings/digital-certificate/digital-certificate.query";
import type { DigitalCertificate } from "@/modules/cfg/settings/digital-certificate/dto/digital-certificate.dto";
import { digitalCertificateService } from "@/modules/cfg/settings/digital-certificate/services/digital-certificate.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function DigitalCertificateListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => digitalCertificateService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: digitalCertificateKeys.all });
            toast.success("Certificado digital excluido");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Nao foi possivel excluir o certificado digital.",
            }),
    });

    const handleDelete = async (row: DigitalCertificate) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <div className="grid gap-4">
            <p className="px-1 text-sm text-base-content/65">
                O certificado e do empregador (seu cliente), nao do Gommo. Cadastre o A1 (.pfx) deste
                tenant para usos futuros de transmissao eSocial.
            </p>
            <QueryTablePanel<DigitalCertificate>
                queryKey={digitalCertificateKeys.all}
                request={() => digitalCertificateService.getAll()}
                columns={DIGITAL_CERTIFICATE_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum certificado digital cadastrado."
                onRowActivate={(row) => startEdit(row.id, row)}
                renderActions={(row) => (
                    <CrudTableActions
                        row={row}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                )}
            />
        </div>
    );
}
