import clsx from "clsx";

type EntityCodeFieldProps = {
    code?: number | null;
    moduleName?: string;
    /** Apenas #código, sem nome do módulo. */
    codeOnly?: boolean;
    className?: string;
};

export function EntityCodeField({ code, moduleName, codeOnly = false, className }: EntityCodeFieldProps) {
    if (code == null) return null;

    if (codeOnly) {
        return <span className={clsx("text-sm font-medium tabular-nums text-secondary", className)}>#{code}</span>;
    }

    return (
        <div className={clsx("text-md text-secondary", className)}>
            {moduleName ? (
                <p className="font-semibold">
                    {moduleName} #{code}
                </p>
            ) : (
                <p className="font-semibold">#{code}</p>
            )}
        </div>
    );
}
