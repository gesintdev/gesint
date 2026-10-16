import clsx from "clsx";

type SkeletonStackProps = {
    /** Quantidade de barras. */
    count?: number;
    /** Classes da barra (altura/raio). Padrao: linha de tabela/form. */
    rowClassName?: string;
    className?: string;
    /** Padding interno padrao das listas/forms. */
    padded?: boolean | "sm" | "md";
};

/**
 * Stack compacto de shimmer. Usa flex (nao grid) para nao esticar linhas
 * quando o pai e uma area alta (ex.: grid-rows 1fr / flex-1).
 */
export function SkeletonStack({
    count = 6,
    rowClassName = "h-10",
    className,
    padded = false,
}: SkeletonStackProps) {
    const padClass =
        padded === true || padded === "md"
            ? "p-5"
            : padded === "sm"
              ? "p-4"
              : undefined;

    return (
        <div className={clsx("skeleton-stack", padClass, className)}>
            {Array.from({length: count}).map((_, index) => (
                <div
                    key={index}
                    className={clsx("skeleton-shimmer w-full", rowClassName)}
                    style={{animationDelay: `${index * 70}ms`}}
                />
            ))}
        </div>
    );
}
