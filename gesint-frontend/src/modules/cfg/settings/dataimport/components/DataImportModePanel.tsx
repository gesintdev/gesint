"use client";

import type {LucideIcon} from "lucide-react";
import {CircleAlert, CircleCheck, Download, FileUp} from "lucide-react";

import type {DataImportEntityType, DataImportMode} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";
import {useDataImportJob} from "@/modules/cfg/settings/dataimport/hooks/useDataImportJob";
import {Button} from "@/shared/components/ui/Button";

type DataImportModePanelProps = {
    entityType: DataImportEntityType;
    mode: DataImportMode;
    title: string;
    description: string;
    icon: LucideIcon;
};

export function DataImportModePanel({entityType, mode, title, description, icon: Icon}: DataImportModePanelProps) {
    const {
        job,
        running,
        progressPercent,
        fileInputRef,
        uploadMutation,
        templateMutation,
        handleUploadClick,
        handleFileChange,
        clearFinished,
    } = useDataImportJob(entityType, mode);

    const finished = job?.jobStatus === "COMPLETED" || job?.jobStatus === "FAILED";
    const titleId = `data-import-${entityType}-${mode}-title`;
    const hasErrors = (job?.errorCount ?? 0) > 0;

    return (
        <section className="gesint-import-mode" aria-labelledby={titleId}>
            <div className="gesint-import-mode__intro">
                <span className="gesint-import-mode__icon" aria-hidden="true">
                    <Icon className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                    <h3 id={titleId} className="gesint-import-mode__title">
                        {title}
                    </h3>
                    <p className="gesint-import-mode__description">{description}</p>
                </div>
            </div>

            <div className="gesint-import-mode__actions">
                <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Download className="size-4" />}
                    loading={templateMutation.isPending}
                    disabled={running}
                    onClick={() => templateMutation.mutate()}
                >
                    Baixar modelo
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    leftIcon={<FileUp className="size-4" />}
                    loading={uploadMutation.isPending}
                    disabled={running}
                    onClick={handleUploadClick}
                >
                    Enviar planilha
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={handleFileChange}
                />
                {finished && job ? (
                    <div
                        className="gesint-import-mode__result"
                        data-tone={hasErrors ? "warning" : "success"}
                    >
                        {hasErrors ? (
                            <CircleAlert className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        ) : (
                            <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        )}
                        <span>
                            Concluído: {job.successCount} sucesso
                            {hasErrors ? `, ${job.errorCount} erro(s)` : ""}.
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={clearFinished}>
                            Limpar
                        </Button>
                    </div>
                ) : null}
            </div>

            {running && job ? (
                <div className="gesint-import-mode__progress">
                    <div className="gesint-import-mode__progress-meta">
                        <span>Importação em andamento...</span>
                        <span className="tabular-nums">
                            {job.processedRows}/{job.totalRows} ({progressPercent}%)
                        </span>
                    </div>
                    <progress
                        className="progress progress-primary w-full"
                        value={progressPercent}
                        max={100}
                        aria-label="Progresso da importação"
                    />
                </div>
            ) : null}

            {finished && job?.errors?.length ? (
                <div className="gesint-import-mode__errors">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Linha</th>
                                <th>Chave</th>
                                <th>Erro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {job.errors.map((error, index) => (
                                <tr key={`${error.rowNumber}-${index}`}>
                                    <td className="tabular-nums">{error.rowNumber || "—"}</td>
                                    <td>{error.matchKey || "—"}</td>
                                    <td>{error.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </section>
    );
}
