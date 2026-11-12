"use client";

type EntityImportLockNoticeProps = {
    entityLabel: string;
};

export function EntityImportLockNotice({entityLabel}: EntityImportLockNoticeProps) {
    return (
        <div className="flex min-h-48 flex-1 items-center justify-center rounded-[var(--radius-gesint-card)] border border-(--gesint-border) bg-base-100 px-6 py-10">
            <div className="max-w-md text-center">
                <p className="text-sm font-semibold text-base-content">Importação em andamento</p>
                <p className="mt-2 text-sm text-base-content/55">
                    A lista de {entityLabel} ficará vazia até a importação Excel terminar. Você pode continuar
                    usando outras telas; o progresso segue em Configurações › Importação.
                </p>
            </div>
        </div>
    );
}
