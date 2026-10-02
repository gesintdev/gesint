"use client";

import { CareersImageField } from "@/modules/careers/admin/components/CareersImageField";
import { CareersListField } from "@/modules/careers/admin/components/CareersListField";
import type { CareersEditorBlock } from "@/modules/careers/admin/lib/careers-editor";
import type { CareersBlockContent } from "@/modules/careers/shared/dto/careers.dto";
import { readBoolean, readList, readString } from "@/modules/careers/shared/lib/careers-blocks";
import { toVideoEmbedUrl } from "@/modules/careers/shared/lib/careers-format";
import { InputCheckbox, InputMarkdown, InputSelect, InputString } from "@/shared/components/ui/input/index";

type CareersBlockFieldsProps = {
    block: CareersEditorBlock;
    disabled?: boolean;
    onChange: (patch: Partial<CareersEditorBlock>) => void;
};

type Row = Record<string, string>;

export function CareersBlockFields({ block, disabled, onChange }: CareersBlockFieldsProps) {
    const content = block.content ?? {};
    const setContent = (patch: CareersBlockContent) => onChange({ content: { ...content, ...patch } });
    const text = (key: string) => readString(content, key);
    const rows = (key: string) => readList<Row>(content, key);

    const common = (
        <>
            <InputString
                label="Título"
                value={block.title ?? ""}
                maxLength={200}
                disabled={disabled}
                onValueChange={(value) => onChange({ title: value })}
            />
            <InputString
                label="Subtítulo"
                value={block.subtitle ?? ""}
                maxLength={400}
                disabled={disabled}
                onValueChange={(value) => onChange({ subtitle: value })}
            />
        </>
    );

    switch (block.type) {
        case "HERO":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputString
                        label="Selo de destaque"
                        hint="Ex.: GPTW 2026, 100% remoto, +500 pessoas."
                        value={text("highlight")}
                        maxLength={60}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ highlight: value })}
                    />
                    <InputString
                        label="Texto do botão"
                        value={text("ctaLabel")}
                        maxLength={40}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ ctaLabel: value })}
                    />
                    <InputSelect
                        label="Alinhamento"
                        items={[
                            { value: "left", label: "À esquerda" },
                            { value: "center", label: "Centralizado" },
                        ]}
                        value={text("align") || "left"}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ align: value })}
                    />
                    <CareersImageField
                        label="Imagem de capa"
                        hint="Opcional. Horizontal, ao menos 1600 px de largura. Sem imagem, a capa usa a cor principal."
                        value={text("coverObjectId")}
                        disabled={disabled}
                        onChange={(objectId) => setContent({ coverObjectId: objectId })}
                    />
                </div>
            );
        case "WHY_WORK_HERE":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputMarkdown
                        label="Texto de abertura"
                        value={text("body")}
                        rows={4}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ body: value })}
                    />
                    <CareersListField
                        label="Diferenciais"
                        items={rows("items")}
                        addLabel="Adicionar diferencial"
                        disabled={disabled}
                        fields={[
                            { key: "title", label: "Título" },
                            { key: "description", label: "Descrição", multiline: true },
                        ]}
                        onChange={(items) => setContent({ items })}
                    />
                </div>
            );
        case "BENEFITS":
            return (
                <div className="grid gap-3">
                    {common}
                    <CareersListField
                        label="Benefícios"
                        items={rows("items")}
                        addLabel="Adicionar benefício"
                        max={24}
                        disabled={disabled}
                        fields={[
                            { key: "title", label: "Benefício" },
                            { key: "description", label: "Detalhe (opcional)" },
                        ]}
                        onChange={(items) => setContent({ items })}
                    />
                </div>
            );
        case "DAY_IN_LIFE":
            return (
                <div className="grid gap-3">
                    {common}
                    <CareersListField
                        label="Fotos"
                        items={rows("photos")}
                        addLabel="Adicionar foto"
                        disabled={disabled}
                        fields={[
                            { key: "objectId", label: "Foto", image: true },
                            { key: "caption", label: "Legenda" },
                        ]}
                        onChange={(photos) => setContent({ photos })}
                    />
                    <CareersListField
                        label="Depoimentos"
                        items={rows("testimonials")}
                        addLabel="Adicionar depoimento"
                        max={8}
                        disabled={disabled}
                        fields={[
                            { key: "name", label: "Nome" },
                            { key: "role", label: "Cargo / área" },
                            { key: "quote", label: "Depoimento", multiline: true },
                            { key: "photoObjectId", label: "Foto (opcional)", image: true },
                        ]}
                        onChange={(testimonials) => setContent({ testimonials })}
                    />
                    <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                        <InputCheckbox
                            size="sm"
                            checked={readBoolean(content, "imageUseAuthorized")}
                            disabled={disabled}
                            onCheckedChange={(checked) => setContent({ imageUseAuthorized: checked })}
                            labelClassName="text-[13px] leading-relaxed text-base-content/80"
                            label="Confirmo que as pessoas que aparecem nas fotos e depoimentos assinaram autorização de uso de imagem e voz."
                        />
                        <p className="mt-2 text-xs text-base-content/55">
                            Obrigatório para publicar este bloco com fotos ou depoimentos (LGPD).
                        </p>
                    </div>
                </div>
            );
        case "OPEN_VACANCIES":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputCheckbox
                        size="sm"
                        checked={content.showFilters !== false}
                        disabled={disabled}
                        onCheckedChange={(checked) => setContent({ showFilters: checked })}
                        label="Mostrar busca e filtros (área, cidade, modelo de trabalho)"
                        labelClassName="text-[13px] text-base-content/80"
                    />
                    <p className="text-xs text-base-content/55">
                        A lista é automática: mostra as vagas marcadas como públicas em Recrutamento. Este bloco não pode
                        ser ocultado.
                    </p>
                </div>
            );
        case "TALENT_POOL":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputString
                        label="Texto do botão"
                        value={text("ctaLabel")}
                        maxLength={40}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ ctaLabel: value })}
                    />
                    <InputString
                        label="Link do botão"
                        hint="Ex.: formulário de cadastro ou página de uma vaga aberta permanente (https://...)."
                        value={text("ctaUrl")}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ ctaUrl: value })}
                    />
                </div>
            );
        case "TEXT":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputMarkdown
                        label="Texto"
                        value={text("body")}
                        rows={6}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ body: value })}
                    />
                </div>
            );
        case "IMAGE_TEXT":
            return (
                <div className="grid gap-3">
                    {common}
                    <CareersImageField
                        label="Imagem"
                        value={text("imageObjectId")}
                        disabled={disabled}
                        onChange={(objectId) => setContent({ imageObjectId: objectId })}
                    />
                    <InputSelect
                        label="Posição da imagem"
                        items={[
                            { value: "left", label: "À esquerda" },
                            { value: "right", label: "À direita" },
                        ]}
                        value={text("imagePosition") || "left"}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ imagePosition: value })}
                    />
                    <InputMarkdown
                        label="Texto"
                        value={text("body")}
                        rows={5}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ body: value })}
                    />
                </div>
            );
        case "STATS":
            return (
                <div className="grid gap-3">
                    {common}
                    <CareersListField
                        label="Indicadores"
                        items={rows("items")}
                        addLabel="Adicionar indicador"
                        max={8}
                        disabled={disabled}
                        fields={[
                            { key: "value", label: "Valor", placeholder: "500+" },
                            { key: "label", label: "Legenda", placeholder: "Colaboradores" },
                        ]}
                        onChange={(items) => setContent({ items })}
                    />
                </div>
            );
        case "FAQ":
            return (
                <div className="grid gap-3">
                    {common}
                    <CareersListField
                        label="Perguntas"
                        items={rows("items")}
                        addLabel="Adicionar pergunta"
                        max={20}
                        disabled={disabled}
                        fields={[
                            { key: "question", label: "Pergunta" },
                            { key: "answer", label: "Resposta", multiline: true },
                        ]}
                        onChange={(items) => setContent({ items })}
                    />
                </div>
            );
        case "VIDEO": {
            const url = text("url");
            return (
                <div className="grid gap-3">
                    {common}
                    <InputString
                        label="Link do vídeo"
                        hint="YouTube ou Vimeo."
                        value={url}
                        disabled={disabled}
                        error={url && !toVideoEmbedUrl(url) ? "Link não reconhecido." : undefined}
                        onValueChange={(value) => setContent({ url: value })}
                    />
                </div>
            );
        }
        case "CTA":
            return (
                <div className="grid gap-3">
                    {common}
                    <InputString
                        label="Texto do botão"
                        value={text("buttonLabel")}
                        maxLength={40}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ buttonLabel: value })}
                    />
                    <InputString
                        label="Link do botão"
                        hint="Use #vagas para rolar até as vagas, ou um link https://."
                        value={text("buttonUrl")}
                        disabled={disabled}
                        onValueChange={(value) => setContent({ buttonUrl: value })}
                    />
                </div>
            );
        default:
            return <div className="grid gap-3">{common}</div>;
    }
}
