"use client";

import {Briefcase, Building2, FileSpreadsheet, Upload, Users} from "lucide-react";

import {DataImportEntityCard} from "@/modules/cfg/settings/dataimport/components/DataImportEntityCard";
import {useHasPermission} from "@/shared/auth/permissions";
import {WorkspaceHeroArt, WorkspaceHeroPage} from "@/shared/components/layout/WorkspaceHeroPage";

export function DataImportPage() {
    const canDepartment = useHasPermission("department:write");
    const canJobPosition = useHasPermission("jobposition:write");
    const canAdmission = useHasPermission("admission:write");
    const hasAny = canDepartment || canJobPosition || canAdmission;

    return (
        <WorkspaceHeroPage
            title="Importação Excel"
            subtitle="Baixe o modelo, envie a planilha e acompanhe o progresso. Erros são listados ao final sem interromper a importação."
            icon={<Upload className="size-6" strokeWidth={2} />}
            art={
                <WorkspaceHeroArt
                    icon={<FileSpreadsheet className="size-12" strokeWidth={1.7} />}
                    badge={<Upload className="size-5" />}
                />
            }
        >
            {!hasAny ? (
                <p className="gesint-import-empty">Você não tem permissão para importar cadastros.</p>
            ) : (
                <div className="gesint-import-list">
                    {canDepartment ? (
                        <DataImportEntityCard
                            entityType="DEPARTMENT"
                            title="Departamentos"
                            systemLabel="DP · match por código na correção"
                            insertHint="Cria novos departamentos. Código é gerado pelo sistema."
                            updateHint="Atualiza departamentos existentes pela coluna codigo."
                            icon={Building2}
                        />
                    ) : null}
                    {canJobPosition ? (
                        <DataImportEntityCard
                            entityType="JOB_POSITION"
                            title="Cargos"
                            systemLabel="DP · match por código na correção"
                            insertHint="Cria novos cargos. Código é gerado pelo sistema."
                            updateHint="Atualiza cargos existentes pela coluna codigo."
                            icon={Briefcase}
                        />
                    ) : null}
                    {canAdmission ? (
                        <DataImportEntityCard
                            entityType="ADMISSION"
                            title="Admissões"
                            systemLabel="RH/DP · match por CPF e/ou CNPJ na correção"
                            insertHint="Cria novas admissões. CPF é obrigatório."
                            updateHint="Atualiza admissões existentes por cpf e/ou provider_cnpj."
                            icon={Users}
                        />
                    ) : null}
                </div>
            )}
        </WorkspaceHeroPage>
    );
}

export default DataImportPage;
