"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { careersPageService } from "@/modules/careers/admin/services/careers-page.service";
import { careersAssetUrl } from "@/modules/careers/shared/lib/careers-assets";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

type CareersImageFieldProps = {
    label: string;
    hint?: string;
    value?: string | null;
    onChange: (objectId: string) => void;
    disabled?: boolean;
    /** Logo usa contain; fotos e capa usam cover. */
    fit?: "contain" | "cover";
};

export function CareersImageField({ label, hint, value, onChange, disabled, fit = "cover" }: CareersImageFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const preview = careersAssetUrl(value);

    const upload = useMutation({
        mutationFn: (file: File) => careersPageService.uploadAsset(file),
        onSuccess: (asset) => {
            setError(null);
            onChange(asset.objectId);
        },
        onError: (err: unknown) => {
            setError(ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível enviar a imagem." }).displayMessage);
        },
    });

    const handleFile = (file?: File) => {
        if (!file) return;
        if (!ACCEPT.split(",").includes(file.type)) {
            setError("Envie uma imagem PNG, JPG, WEBP ou GIF.");
            return;
        }
        if (file.size > MAX_BYTES) {
            setError("A imagem deve ter no máximo 5 MB.");
            return;
        }
        upload.mutate(file);
    };

    return (
        <div className="grid gap-1.5">
            <span className="text-sm text-base-content/80">{label}</span>
            <div className="flex items-center gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--gesint-border-subtle) bg-base-200">
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt=""
                            className={fit === "contain" ? "size-full object-contain p-1" : "size-full object-cover"}
                        />
                    ) : (
                        <ImagePlus className="size-5 text-base-content/35" strokeWidth={1.75} />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={upload.isPending}
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        {preview ? "Trocar" : "Enviar imagem"}
                    </Button>
                    {preview ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            leftIcon={<Trash2 className="size-3.5" strokeWidth={2} />}
                            onClick={() => onChange("")}
                        >
                            Remover
                        </Button>
                    ) : null}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />
            </div>
            {hint ? <p className="text-xs text-base-content/50">{hint}</p> : null}
            {error ? <p className="text-xs text-error">{error}</p> : null}
        </div>
    );
}
