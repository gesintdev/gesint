"use client";

import { PJ_RECESS_GUIDANCE } from "@/modules/person/vacation/lib/pj-recess";

export function VacationPjNotice() {
    return (
        <div className="rounded-lg border border-info/25 bg-info/5 px-3 py-2">
            <p className="text-sm font-medium text-base-content">{PJ_RECESS_GUIDANCE.title}</p>
            <p className="mt-1 text-sm text-base-content/75">{PJ_RECESS_GUIDANCE.summary}</p>
            <ul className="mt-2 list-inside list-disc text-sm text-base-content/70">
                {PJ_RECESS_GUIDANCE.bullets.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
