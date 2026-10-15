"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CandidatePortalShell } from "@/modules/careers/portal/components/CandidatePortalShell";
import { useCandidateSession } from "@/modules/careers/portal/hooks/useCandidateSession";
import {
    candidatePortalKeys,
    candidatePortalService,
} from "@/modules/careers/portal/services/candidate-portal.service";
import { Button } from "@/shared/components/ui/Button";
import {
    InputCheckbox,
    InputDate,
    InputPhone,
    InputSelect,
    InputString,
    type SelectItem,
} from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const DOCUMENT_TYPE_ITEMS: SelectItem[] = [
    { value: "RG", label: "RG" },
    { value: "CPF", label: "CPF" },
    { value: "COMPROVANTE_ENDERECO", label: "Comprovante de endereço" },
    { value: "CTPS", label: "CTPS" },
    { value: "TITULO_ELEITOR", label: "Título de eleitor" },
    { value: "CERTIDAO_NASCIMENTO", label: "Certidão de nascimento" },
    { value: "COMPROVANTE_ESCOLARIDADE", label: "Comprovante de escolaridade" },
];

export function CandidatePreAdmissionClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const queryClient = useQueryClient();
    const { ready, isAuthenticated } = useCandidateSession();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [bankAgency, setBankAgency] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankAccountDigit, setBankAccountDigit] = useState("");
    const [pixKey, setPixKey] = useState("");
    const [pcdSelfDeclared, setPcdSelfDeclared] = useState(false);
    const [documentType, setDocumentType] = useState("RG");

    useEffect(() => {
        if (ready && !isAuthenticated) {
            const next = `/careers/portal/pre-admission${token ? `?token=${encodeURIComponent(token)}` : ""}`;
            router.replace(`/careers/portal/login?next=${encodeURIComponent(next)}`);
        }
    }, [ready, isAuthenticated, router, token]);

    const preAdmissionQuery = useQuery({
        queryKey: candidatePortalKeys.preAdmission(token),
        queryFn: () => candidatePortalService.getPreAdmission(token),
        enabled: isAuthenticated,
    });

    useEffect(() => {
        const data = preAdmissionQuery.data;
        if (!data) return;
        setPhone(data.phone ?? "");
        setBirthDate(data.birthDate ?? "");
        setBankCode(data.bankCode ?? "");
        setBankAgency(data.bankAgency ?? "");
        setBankAccount(data.bankAccount ?? "");
        setBankAccountDigit(data.bankAccountDigit ?? "");
        setPixKey(data.pixKey ?? "");
        setPcdSelfDeclared(Boolean(data.pcdSelfDeclared));
    }, [preAdmissionQuery.data]);

    const saveMutation = useMutation({
        mutationFn: () =>
            candidatePortalService.updatePreAdmission(
                {
                    phone,
                    birthDate: birthDate || null,
                    bankCode,
                    bankAgency,
                    bankAccount,
                    bankAccountDigit,
                    pixKey,
                    pcdSelfDeclared: preAdmissionQuery.data?.affirmativePcd ? pcdSelfDeclared : undefined,
                },
                token,
            ),
        onSuccess: async () => {
            setMessage("Dados salvos.");
            setError(null);
            await queryClient.invalidateQueries({ queryKey: candidatePortalKeys.preAdmission(token) });
        },
        onError: (err) => {
            setError(ExceptionCapture.displayMessage(err, "Não foi possível salvar a pré-admissão."));
        },
    });

    const completeMutation = useMutation({
        mutationFn: () => candidatePortalService.completePreAdmission(token),
        onSuccess: async () => {
            setMessage("Pré-admissão concluída.");
            await queryClient.invalidateQueries({ queryKey: candidatePortalKeys.preAdmission(token) });
            await queryClient.invalidateQueries({ queryKey: candidatePortalKeys.applications });
        },
        onError: (err) => {
            setError(ExceptionCapture.displayMessage(err, "Conclua os itens obrigatórios antes de finalizar."));
        },
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            candidatePortalService.uploadPreAdmissionDocument(file, documentType, token),
        onSuccess: async () => {
            setMessage("Documento enviado.");
            setError(null);
            await queryClient.invalidateQueries({ queryKey: candidatePortalKeys.preAdmission(token) });
        },
        onError: (err) => {
            setError(ExceptionCapture.displayMessage(err, "Não foi possível enviar o documento."));
        },
    });

    if (!ready || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200 text-sm text-base-content/60">
                Carregando pré-admissão…
            </div>
        );
    }

    const view = preAdmissionQuery.data;
    const completed = Boolean(view?.completed);

    return (
        <CandidatePortalShell title="Pré-admissão" organizationName={undefined}>
            <div className="mb-4">
                <Link href="/careers/portal" className="text-sm font-semibold text-primary">
                    ← Voltar ao portal
                </Link>
            </div>
            {message ? <p className="mb-3 text-sm text-success">{message}</p> : null}
            {error ? <p className="mb-3 text-sm text-error">{error}</p> : null}

            {preAdmissionQuery.isLoading ? (
                <div className="skeleton-shimmer h-40 rounded-xl" />
            ) : preAdmissionQuery.isError ? (
                <p className="text-sm text-error">
                    {ExceptionCapture.displayMessage(
                        preAdmissionQuery.error,
                        "Pré-admissão não encontrada para esta conta.",
                    )}
                </p>
            ) : (
                <div className="grid gap-5">
                    <div className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                        <h2 className="text-base font-bold">{view?.jobTitle ?? "Sua admissão"}</h2>
                        <p className="mt-1 text-xs text-base-content/55">
                            Preencha os dados abaixo. Documentos e bancários são obrigatórios; eSocial fica a cargo do
                            RH.
                        </p>
                        <ul className="mt-3 grid gap-1.5 text-xs text-base-content/70">
                            {(view?.pendingItems ?? []).map((item) => (
                                <li key={item.key}>
                                    {item.done ? "✓" : "○"} {item.label}
                                    {item.required ? "" : " (opcional)"}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <section className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/55">
                            Dados pessoais
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InputString label="Nome" value={view?.fullName ?? ""} disabled />
                            <InputString label="CPF" value={view?.cpf ?? ""} disabled />
                            <InputPhone
                                label="Telefone"
                                value={phone}
                                onValueChange={setPhone}
                                disabled={completed}
                            />
                            <InputDate
                                label="Data de nascimento"
                                value={birthDate}
                                onValueChange={setBirthDate}
                                disabled={completed}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/55">
                            Dados bancários
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InputString
                                label="Banco (código)"
                                value={bankCode}
                                onValueChange={setBankCode}
                                disabled={completed}
                            />
                            <InputString
                                label="Agência"
                                value={bankAgency}
                                onValueChange={setBankAgency}
                                disabled={completed}
                            />
                            <InputString
                                label="Conta"
                                value={bankAccount}
                                onValueChange={setBankAccount}
                                disabled={completed}
                            />
                            <InputString
                                label="Dígito"
                                value={bankAccountDigit}
                                onValueChange={setBankAccountDigit}
                                disabled={completed}
                            />
                            <InputString
                                label="Chave Pix"
                                value={pixKey}
                                onValueChange={setPixKey}
                                disabled={completed}
                                wrapperClassName="sm:col-span-2"
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/55">
                            Documentos
                        </h3>
                        {(view?.documents ?? []).length > 0 ? (
                            <ul className="mb-3 grid gap-1 text-xs text-base-content/70">
                                {(view?.documents ?? []).map((doc) => (
                                    <li key={doc.linkId}>
                                        {doc.documentType ?? "DOC"}
                                        {doc.displayName ? ` — ${doc.displayName}` : ""}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mb-3 text-xs text-base-content/50">Nenhum documento enviado ainda.</p>
                        )}
                        {!completed ? (
                            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                <InputSelect
                                    label="Tipo do documento"
                                    items={DOCUMENT_TYPE_ITEMS}
                                    value={documentType}
                                    onValueChange={(v) => setDocumentType(v || "RG")}
                                />
                                <label className="gommo-btn gommo-btn--outline cursor-pointer text-sm">
                                    {uploadMutation.isPending ? "Enviando…" : "Enviar arquivo"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        disabled={uploadMutation.isPending}
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) uploadMutation.mutate(file);
                                            event.target.value = "";
                                        }}
                                    />
                                </label>
                            </div>
                        ) : null}
                    </section>

                    {view?.affirmativePcd ? (
                        <section className="rounded-xl border border-base-content/10 bg-base-100 p-4 sm:p-5">
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-base-content/55">
                                Autodeclaração PCD
                            </h3>
                            <InputCheckbox
                                size="sm"
                                checked={pcdSelfDeclared}
                                disabled={completed}
                                onCheckedChange={setPcdSelfDeclared}
                                label="Declaro-me pessoa com deficiência (opcional; dado separado da avaliação)"
                                labelClassName="text-[13px] text-base-content/75"
                            />
                        </section>
                    ) : null}

                    {!completed ? (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                loading={saveMutation.isPending}
                                onClick={() => saveMutation.mutate()}
                            >
                                Salvar
                            </Button>
                            <Button
                                type="button"
                                loading={completeMutation.isPending}
                                onClick={() => completeMutation.mutate()}
                            >
                                Concluir pré-admissão
                            </Button>
                        </div>
                    ) : (
                        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                            Pré-admissão concluída
                            {view?.completedAt
                                ? ` em ${new Date(view.completedAt).toLocaleDateString("pt-BR")}`
                                : ""}
                            .
                        </p>
                    )}
                </div>
            )}
        </CandidatePortalShell>
    );
}
