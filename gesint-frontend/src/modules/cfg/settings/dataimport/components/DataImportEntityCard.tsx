"use client";

import type {LucideIcon} from "lucide-react";
import {RefreshCw, UserPlus} from "lucide-react";

import {DataImportModePanel} from "@/modules/cfg/settings/dataimport/components/DataImportModePanel";
import type {DataImportEntityType} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";

type DataImportEntityCardProps = {
    entityType: DataImportEntityType;
    title: string;
    systemLabel: string;
    insertHint: string;
    updateHint: string;
    icon: LucideIcon;
};

export function DataImportEntityCard({
    entityType,
    title,
    systemLabel,
    insertHint,
    updateHint,
    icon: Icon,
}: DataImportEntityCardProps) {
    const titleId = `data-import-${entityType}-title`;

    return (
        <article className="gesint-import-entity" aria-labelledby={titleId}>
            <header className="gesint-import-entity__header">
                <span className="gesint-import-entity__icon" aria-hidden="true">
                    <Icon className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                    <h2 id={titleId} className="gesint-import-entity__title">
                        {title}
                    </h2>
                    <p className="gesint-import-entity__subtitle">{systemLabel}</p>
                </div>
            </header>
            <div className="gesint-import-entity__modes">
                <DataImportModePanel
                    entityType={entityType}
                    mode="INSERT"
                    title="Inserção"
                    description={insertHint}
                    icon={UserPlus}
                />
                <DataImportModePanel
                    entityType={entityType}
                    mode="UPDATE"
                    title="Correção"
                    description={updateHint}
                    icon={RefreshCw}
                />
            </div>
        </article>
    );
}
