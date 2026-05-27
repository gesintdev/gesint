"use client";

import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";

type ComingSoonViewProps = {
    title: string;
    description?: string;
};

export function ComingSoonView({ title, description }: ComingSoonViewProps) {
    return (
        <WorkspacePage>
            <div className="flex min-h-[14rem] flex-col items-center justify-center gap-2 p-8 text-center">
                <h2 className="text-lg font-semibold text-base-content">{title}</h2>
                <p className="max-w-md text-sm text-base-content/55">
                    {description ?? "Funcionalidade prevista para uma próxima entrega."}
                </p>
            </div>
        </WorkspacePage>
    );
}
