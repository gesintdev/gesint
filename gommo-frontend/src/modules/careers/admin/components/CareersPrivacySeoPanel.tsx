"use client";

import type { CareersPageTheme } from "@/modules/careers/admin/dto/careers-page.dto";
import { Button } from "@/shared/components/ui/Button";
import { InputMarkdown, InputNumber, InputString } from "@/shared/components/ui/input/index";

type CareersPrivacySeoPanelProps = {
    theme: CareersPageTheme;
    organizationName: string;
    defaultPrivacyNotice: string;
    privacyNoticeVersion: number;
    disabled?: boolean;
    onChange: (patch: Partial<CareersPageTheme>) => void;
};

export function CareersPrivacySeoPanel({
    theme,
    organizationName,
    defaultPrivacyNotice,
    privacyNoticeVersion,
    disabled,
    onChange,
}: CareersPrivacySeoPanelProps) {
    const customNotice = Boolean(theme.privacyNotice?.trim());
    const seoTitle = theme.seoTitle ?? "";
    const seoDescription = theme.seoDescription ?? "";

    return (
        <div className="grid gap-6">
            <section className="grid gap-3">
                <h3 className="text-sm font-semibold text-base-content">Busca e compartilhamento</h3>
                <InputString
                    label="Título para Google e redes"
                    hint={`${seoTitle.length}/70 · vazio: "Trabalhe na ${theme.displayName?.trim() || organizationName}".`}
                    value={seoTitle}
                    maxLength={70}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ seoTitle: value })}
                />
                <InputString
                    label="Descrição"
                    hint={`${seoDescription.length}/160 · aparece abaixo do título na busca e no WhatsApp.`}
                    value={seoDescription}
                    maxLength={160}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ seoDescription: value })}
                />
                <p className="text-xs text-base-content/50">
                    Cada vaga publicada já sai com dados estruturados para o Google for Jobs.
                </p>
            </section>

            <section className="grid gap-3">
                <h3 className="text-sm font-semibold text-base-content">Candidatura (LGPD)</h3>
                <p className="text-xs leading-relaxed text-base-content/55">
                    O formulário pede só nome, e-mail, telefone e currículo ou experiências. CPF e data de nascimento ficam
                    para a pré-admissão. O candidato aceita o aviso deste processo (obrigatório) e, separadamente, o banco
                    de talentos (opcional). A versão aceita fica registrada na candidatura.
                </p>
                <InputNumber
                    label="Prazo do banco de talentos"
                    hint="Entre 1 e 24 meses."
                    value={theme.talentPoolMonths}
                    integer
                    decimalPlaces={0}
                    thousandSeparator={false}
                    suffix="meses"
                    align="left"
                    disabled={disabled}
                    wrapperClassName="max-w-xs"
                    onValueChange={(value) =>
                        onChange({ talentPoolMonths: Math.min(24, Math.max(1, value ?? 12)) })
                    }
                />
                <InputMarkdown
                    label="Aviso de privacidade"
                    hint={
                        customNotice
                            ? `Texto próprio. Ao publicar uma alteração, a versão sobe (atual: v${privacyNoticeVersion}).`
                            : "Vazio: usa o aviso padrão do Gesint."
                    }
                    value={theme.privacyNotice ?? ""}
                    placeholder={defaultPrivacyNotice}
                    rows={10}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ privacyNotice: value })}
                />
                <div className="flex flex-wrap gap-2">
                    {!customNotice ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={() => onChange({ privacyNotice: defaultPrivacyNotice })}
                        >
                            Partir do texto padrão
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            onClick={() => onChange({ privacyNotice: "" })}
                        >
                            Voltar ao aviso padrão
                        </Button>
                    )}
                </div>
            </section>
        </div>
    );
}
