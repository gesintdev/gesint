import type { ReactNode } from "react";

/** Remonta a cada navegação (o layout não): só o conteúdo do formulário anima a entrada. */
export default function AuthTemplate({ children }: { children: ReactNode }) {
    return <div className="login-main__content animate-fade-up">{children}</div>;
}
