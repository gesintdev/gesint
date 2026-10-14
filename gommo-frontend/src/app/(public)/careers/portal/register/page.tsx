import { Suspense } from "react";

import { CandidateAuthForm } from "@/modules/careers/portal/components/CandidateAuthForm";
import { CandidatePortalShell } from "@/modules/careers/portal/components/CandidatePortalShell";

export default function CandidatePortalRegisterPage() {
    return (
        <CandidatePortalShell title="Criar conta de candidato">
            <div className="rounded-xl border border-base-content/10 bg-base-100 p-5 sm:p-6">
                <p className="mb-5 text-sm text-base-content/60">
                    Crie sua conta para acompanhar a triagem das vagas desta empresa. Voce tambem pode entrar
                    com Google quando estiver configurado.
                </p>
                <Suspense fallback={<p className="text-sm text-base-content/50">Carregando…</p>}>
                    <CandidateAuthForm mode="register" />
                </Suspense>
            </div>
        </CandidatePortalShell>
    );
}
