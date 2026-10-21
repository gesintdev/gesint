import { Suspense } from "react";

import { CandidateAuthForm } from "@/modules/careers/portal/components/CandidateAuthForm";
import { CandidatePortalShell } from "@/modules/careers/portal/components/CandidatePortalShell";

export default function CandidatePortalLoginPage() {
    return (
        <CandidatePortalShell title="Entrar no portal do candidato">
            <div className="rounded-xl border border-base-content/10 bg-base-100 p-5 sm:p-6">
                <p className="mb-5 text-sm text-base-content/60">
                    Acompanhe suas candidaturas neste ambiente. Sua sessao e separada do sistema interno da
                    empresa.
                </p>
                <Suspense fallback={<p className="text-sm text-base-content/50">Carregando…</p>}>
                    <CandidateAuthForm mode="login" />
                </Suspense>
            </div>
        </CandidatePortalShell>
    );
}
