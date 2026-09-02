"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { digitalCertificateKeys } from "@/modules/cfg/settings/digital-certificate/digital-certificate.query";
import type { DigitalCertificateCreateDto } from "@/modules/cfg/settings/digital-certificate/dto/digital-certificate.dto";
import {
    digitalCertificateToFormDto,
    emptyDigitalCertificateForm,
    fileToBase64,
} from "@/modules/cfg/settings/digital-certificate/lib/digital-certificate.mapper";
import {
    DIGITAL_CERTIFICATE_ENVIRONMENT_ITEMS,
    DIGITAL_CERTIFICATE_PURPOSE_ITEMS,
} from "@/modules/cfg/settings/digital-certificate/lib/digital-certificate.options";
import { digitalCertificateService } from "@/modules/cfg/settings/digital-certificate/services/digital-certificate.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import {
    InputCheckbox,
    InputFile,
    InputInfo,
    InputPassword,
    InputSelect,
    InputString,
} from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { digitsOnly } from "@/shared/lib/input/digits";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Certificado" },
    { id: "arquivo", label: "Arquivo A1" },
];

export function DigitalCertificateFormClient() {
    const { editingId, isEditing, goToList, returnToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<DigitalCertificateCreateDto>(emptyDigitalCertificateForm);
    const [fileName, setFileName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: digitalCertificateKeys.detail(editingId ?? ""),
        queryFn: () => digitalCertificateService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyDigitalCertificateForm());
            setFileName("");
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(digitalCertificateToFormDto(detailQuery.data));
            setFileName("");
            setError(null);
        }
    }, [isEditing, detailQuery.data]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: digitalCertificateToFormDto,
        getEmptyForm: () => emptyDigitalCertificateForm(),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: DigitalCertificateCreateDto) => {
            const payload: DigitalCertificateCreateDto = {
                alias: dto.alias.trim(),
                certificateType: "A1",
                purpose: dto.purpose,
                environment: dto.environment,
                ownerDocument: dto.ownerDocument ? digitsOnly(dto.ownerDocument) : undefined,
                isDefault: Boolean(dto.isDefault),
                pkcs12Base64: dto.pkcs12Base64 || undefined,
                password: dto.password || undefined,
            };
            if (isEditing && editingId) return digitalCertificateService.update(editingId, payload);
            return digitalCertificateService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: digitalCertificateKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: digitalCertificateKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Certificado atualizado" : "Certificado cadastrado");
            setForm(emptyDigitalCertificateForm());
            returnToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Nao foi possivel salvar o certificado digital.",
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof DigitalCertificateCreateDto>(
        field: K,
        value: DigitalCertificateCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            setFileName("");
            update("pkcs12Base64", undefined);
            return;
        }
        const lower = file.name.toLowerCase();
        if (!lower.endsWith(".pfx") && !lower.endsWith(".p12")) {
            setError("Selecione um arquivo .pfx ou .p12 (certificado A1).");
            setFileName("");
            update("pkcs12Base64", undefined);
            return;
        }
        setError(null);
        setFileName(file.name);
        update("pkcs12Base64", await fileToBase64(file));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.alias.trim()) {
            setError("Informe um alias para identificar o certificado.");
            return;
        }
        if (!isEditing && (!form.pkcs12Base64 || !form.password)) {
            setError("No cadastro, envie o arquivo A1 e a senha do certificado.");
            return;
        }
        if (form.pkcs12Base64 && !form.password) {
            setError("Informe a senha ao substituir o arquivo do certificado.");
            return;
        }
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        "Nao foi possivel carregar o certificado.",
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="dados"
                title="Dados do certificado"
                description="Certificado ICP-Brasil A1 do empregador deste tenant. Senha e arquivo nunca sao exibidos apos o cadastro."
            >
                <InputString
                    label="Alias"
                    value={form.alias}
                    onValueChange={(v) => update("alias", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Finalidade"
                    value={form.purpose}
                    onValueChange={(v) => update("purpose", v as DigitalCertificateCreateDto["purpose"])}
                    items={DIGITAL_CERTIFICATE_PURPOSE_ITEMS}
                    required
                    wrapperClassName="sm:col-span-3"
                />
                <InputSelect
                    label="Ambiente"
                    value={form.environment}
                    onValueChange={(v) =>
                        update("environment", v as DigitalCertificateCreateDto["environment"])
                    }
                    items={DIGITAL_CERTIFICATE_ENVIRONMENT_ITEMS}
                    required
                    wrapperClassName="sm:col-span-3"
                />
                <InputString
                    label="CNPJ/CPF do titular"
                    value={form.ownerDocument ?? ""}
                    onValueChange={(v) => update("ownerDocument", digitsOnly(v).slice(0, 14))}
                    wrapperClassName="sm:col-span-4"
                    hint="Preenchido automaticamente pelo certificado quando possivel."
                />
                <InputInfo label="Tipo" value="A1 (.pfx / .p12)" wrapperClassName="sm:col-span-4" />
                <div className="sm:col-span-4 flex items-end pb-2">
                    <InputCheckbox
                        label="Usar como padrao deste tenant"
                        checked={Boolean(form.isDefault)}
                        onCheckedChange={(checked) => update("isDefault", checked)}
                    />
                </div>
                {isEditing && detailQuery.data ? (
                    <>
                        <InputInfo
                            label="Titular (subject)"
                            value={detailQuery.data.subjectName || "—"}
                            wrapperClassName="sm:col-span-12"
                        />
                        <InputInfo
                            label="Valido ate"
                            value={detailQuery.data.validUntil || "—"}
                            wrapperClassName="sm:col-span-4"
                        />
                        <InputInfo
                            label="Thumbprint"
                            value={detailQuery.data.thumbprint || "—"}
                            wrapperClassName="sm:col-span-8"
                        />
                    </>
                ) : null}
            </FormSection>

            <FormSection
                id="arquivo"
                title="Arquivo A1"
                description={
                    isEditing
                        ? "Deixe em branco para manter o arquivo atual. Para substituir, envie um novo .pfx/.p12 e a senha."
                        : "Envie o PKCS#12 do empregador. O Gesint cifra o arquivo e a senha em repouso."
                }
            >
                <InputFile
                    label="Arquivo .pfx / .p12"
                    accept=".pfx,.p12,application/x-pkcs12"
                    fileName={fileName}
                    onFileChange={(file) => void handleFileChange(file)}
                    required={!isEditing}
                    wrapperClassName="sm:col-span-8"
                    hint={
                        isEditing && detailQuery.data?.certificateUploaded && !fileName
                            ? "Arquivo ja cadastrado (conteudo oculto por seguranca)."
                            : undefined
                    }
                />
                <InputPassword
                    label="Senha do certificado"
                    value={form.password ?? ""}
                    onValueChange={(v) => update("password", v)}
                    required={!isEditing || Boolean(form.pkcs12Base64)}
                    wrapperClassName="sm:col-span-4"
                    autoComplete="new-password"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
