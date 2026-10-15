import { Suspense } from "react";

import { CandidatePreAdmissionClient } from "@/modules/careers/portal/components/CandidatePreAdmissionClient";

export default function CandidatePreAdmissionPage() {
    return (
        <Suspense fallback={<p className="p-6 text-sm text-base-content/50">Carregando…</p>}>
            <CandidatePreAdmissionClient />
        </Suspense>
    );
}
