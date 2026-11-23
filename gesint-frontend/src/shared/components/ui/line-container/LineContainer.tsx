import {ReactNode} from "react";

type LineContainerProps = {
    children: ReactNode
}

export function LineContainer({children}: LineContainerProps) {
    return (
        <div className="w-auto flex flex-wrap items-center justify-end gap-2">
            {children}
        </div>
    )
}
