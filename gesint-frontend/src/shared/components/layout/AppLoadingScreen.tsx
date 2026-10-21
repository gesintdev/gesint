import clsx from "clsx";

import { SystemLogo } from "@/shared/components/brand/SystemLogo";

/** Mensagem padrão de boot/sessão/ambiente — uma só tela de loading no app. */
export const APP_LOADING_MESSAGE = "Preparando seu ambiente...";

type AppLoadingScreenProps = {
    message?: string;
    /** `fullscreen` ocupa a viewport (boot/sessão); `inline` preenche o container (Suspense do shell). */
    variant?: "fullscreen" | "inline";
};

/**
 * Tela de carregamento padrão do sistema: monograma da marca dentro de um anel girando,
 * mensagem e barra indeterminada. Só CSS (`.app-loading*` no globals.css).
 * Usar este componente em todo boot/sessão/ambiente — sem telas de loading paralelas.
 */
export function AppLoadingScreen({
    message = APP_LOADING_MESSAGE,
    variant = "fullscreen",
}: AppLoadingScreenProps) {
    return (
        <div
            className={clsx("app-loading", variant === "inline" && "app-loading--inline")}
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="app-loading__mark">
                <span className="app-loading__ring" aria-hidden="true" />
                <SystemLogo variant="monogram" size="1.625rem" />
            </div>
            <p className="app-loading__message">{message}</p>
            <div className="app-loading__bar" aria-hidden="true">
                <span />
            </div>
        </div>
    );
}
